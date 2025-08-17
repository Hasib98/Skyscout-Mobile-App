import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// This hook is assumed to be defined elsewhere and works as expected
import { useWeather } from '../hooks/useWeather'; 
import LoadingSkeleton from './LoadingSkeleton';

/**
 * A helper function to translate WMO weather codes into descriptive strings.
 * This makes the app more user-friendly.
 */
const getWeatherCodeDescription = (code) => {
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
    case 2:
    case 3:
      return 'Mainly clear, partly cloudy, and overcast';
    case 45:
    case 48:
      return 'Fog and depositing rime fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow fall';
    case 77:
      return 'Snow grains';
    case 80:
    case 81:
    case 82:
      return 'Rain showers';
    case 85:
    case 86:
      return 'Snow showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with slight and heavy hail';
    default:
      return 'Unknown';
  }
};

/**
 * Get weather emoji based on weather code
 */
const getWeatherEmoji = (code, isDay) => {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if ([1, 2, 3].includes(code)) return isDay ? '⛅' : '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67].includes(code)) return '🌧️';
  if ([71, 73, 75, 77].includes(code)) return '❄️';
  if ([80, 81, 82].includes(code)) return '🌦️';
  if ([85, 86].includes(code)) return '🌨️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌤️';
};

/**
 * Get background color based on time of day and weather
 */
const getBackgroundColor = (isDay, weatherCode) => {
  if (!isDay) {
    return '#1a1a2e'; // Night color
  }
  
  if ([95, 96, 99].includes(weatherCode)) {
    return '#434343'; // Storm color
  }
  
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return '#74b9ff'; // Rain color
  }
  
  return '#74b9ff'; // Default day color
};

const WeatherDisplay = ({ lat, lon }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;



  const {weatherData}  = useWeather(lat, lon);

  console.log("weather Data", JSON.stringify(weatherData));
  const loading = false;
  const error = null;

  useEffect(() => {
    if (weatherData && !loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [weatherData, loading]);


  const renderHourlyItem = ({ item, index }) => {
  const hourly = weatherData.hourly || {};
  const timeStr = hourly.time?.[index];
  const temp = hourly.temperature_2m?.[index] ?? 0; // fallback to 0 if missing
  const precipitation = hourly.precipitation_probability?.[index] ?? 0;
  const weatherCode = hourly.weather_code?.[index] ?? 0;

  if (!timeStr) return null; // skip if no time

  const time = new Date(timeStr);
  const hour = time.getHours();
  const isCurrentHour = index === new Date().getHours();

  return (
    <Animated.View 
      style={[
        styles.hourlyItem,
        isCurrentHour && styles.currentHourItem,
        {
          transform: [{
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            })
          }]
        }
      ]}
    >
      <Text style={[styles.hourlyTime, isCurrentHour && styles.currentHourText]}>
        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
      </Text>
      
      <View style={styles.weatherIconContainer}>
        <Text style={styles.weatherEmoji}>
          {getWeatherEmoji(weatherCode, hour >= 6 && hour < 18)}
        </Text>
      </View>
      
      <Text style={[styles.hourlyTemp, isCurrentHour && styles.currentHourText]}>
        {Math.round(temp)}°
      </Text>
      
      <View style={styles.precipitationContainer}>
        <View style={styles.precipitationBar}>
          <View 
            style={[
              styles.precipitationFill, 
              { height: `${precipitation}%` }
            ]} 
          />
        </View>
        <Text style={styles.precipitationText}>{precipitation}%</Text>
      </View>
    </Animated.View>
  );
};



  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: '#d63031' }]}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>
          Unable to fetch weather data
        </Text>
        <Text style={styles.errorSubText}>Please check your connection</Text>
      </View>
    );
  }

  if (loading || !weatherData || !weatherData.current_weather) return <LoadingSkeleton isDarkMode={true}/>


  const { current_weather, current_weather_units } = weatherData;
  const backgroundColor = getBackgroundColor(current_weather.is_day === 1, current_weather.weathercode);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[styles.container, { backgroundColor }]}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.ScrollView 
            contentContainerStyle={styles.mainContainer}
            style={{ opacity: fadeAnim }}
          >
            {/* Current Weather Section */}
            <Animated.View 
              style={[
                styles.currentWeatherContainer,
                {
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <Text style={styles.locationText}>
                {weatherData.timezone.split('/')[1].replace('_', ' ')}
              </Text>
              
              <View style={styles.currentTempContainer}>
                <Text style={styles.weatherMainEmoji}>
                  {getWeatherEmoji(current_weather.weathercode, current_weather.is_day === 1)}
                </Text>
                <Text style={styles.temperatureText}>
                  {Math.round(current_weather.temperature)}°
                </Text>
              </View>
              
              <Text style={styles.weatherDescription}>
                {getWeatherCodeDescription(current_weather.weathercode)}
              </Text>
              
              <View style={styles.weatherDetailsContainer}>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.detailEmoji}>💨</Text>
                  <Text style={styles.detailLabel}>Wind</Text>
                  <Text style={styles.detailValue}>
                    {current_weather.windspeed} {current_weather_units.windspeed}
                  </Text>
                </View>
                
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.detailEmoji}>🧭</Text>
                  <Text style={styles.detailLabel}>Direction</Text>
                  <Text style={styles.detailValue}>
                    {current_weather.winddirection}°
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Hourly Forecast Section */}
            <Animated.View 
              style={[
                styles.hourlyContainer,
                {
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 30],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.hourlyHeader}>
                <Text style={styles.hourlyTitle}>24-Hour Forecast</Text>
                <Text style={styles.hourlySubtitle}>Temperature & Rain Chance</Text>
              </View>
              
              <FlatList
                data={Array(24).fill(null)}
                renderItem={renderHourlyItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                keyExtractor={(_, index) => index.toString()}
                snapToInterval={width * 0.2}
                decelerationRate="fast"
              />
            </Animated.View>
          </Animated.ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  currentWeatherContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    marginBottom: 25,
    // backdropFilter: 'blur(10px)',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 10 },
    // shadowOpacity: 0.3,
    // shadowRadius: 20,
    // elevation: 10,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
    opacity: 0.9,
  },
  currentTempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weatherMainEmoji: {
    fontSize: 60,
    marginRight: 15,
  },
  temperatureText: {
    fontSize: 72,
    fontWeight: '200',
    color: '#ffffff',
  },
  weatherDescription: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  weatherDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  weatherDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  hourlyContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 20,
    // backdropFilter: 'blur(10px)',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 10 },
    // shadowOpacity: 0.3,
    // shadowRadius: 20,
    // elevation: 10,
  },
  hourlyHeader: {
    marginBottom: 20,
  },
  hourlyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  hourlySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  flatListContent: {
    paddingHorizontal: 5,
  },
  hourlyItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  currentHourItem: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ scale: 1.05 }],
  },
  hourlyTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  currentHourText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  weatherIconContainer: {
    marginBottom: 8,
  },
  weatherEmoji: {
    fontSize: 28,
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  precipitationContainer: {
    alignItems: 'center',
  },
  precipitationBar: {
    width: 4,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  precipitationFill: {
    width: '100%',
    backgroundColor: '#00b894',
    position: 'absolute',
    bottom: 0,
    borderRadius: 2,
  },
  precipitationText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});

export default WeatherDisplay;