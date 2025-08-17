import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// This hook is assumed to be defined elsewhere and works as expected
// It should handle the API call and return the data, loading state, and any errors.
// import { useWeather } from '../hooks/useWeather'; 

/**
 * A helper function to translate WMO weather codes into descriptive strings.
 * This makes the app more user-friendly.
 * A more complete list can be found at: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO_Code-99.html
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

const WeatherDisplay = ({ lat, lon }) => {
  // Using a mock hook and data for demonstration since the user's hook is not provided.
  // In a real application, you would uncomment the user's hook.
  // const { weatherData, loading, error } = useWeather(lat, lon);
  
  const mockWeatherData = {
    "latitude": 23.75,
    "longitude": 90.375,
    "generationtime_ms": 0.07748603820800781,
    "utc_offset_seconds": 21600,
    "timezone": "Asia/Dhaka",
    "timezone_abbreviation": "GMT+6",
    "elevation": 12.0,
    "current_weather_units": {
      "time": "iso8601",
      "interval": "seconds",
      "temperature": "°C",
      "windspeed": "km/h",
      "winddirection": "°",
      "is_day": "",
      "weathercode": "wmo code"
    },
    "current_weather": {
      "time": "2025-08-17T22:30",
      "interval": 900,
      "temperature": 28.4,
      "windspeed": 4.8,
      "winddirection": 153,
      "is_day": 0,
      "weathercode": 3
    },
    "hourly_units": {
      "time": "iso8601",
      "precipitation_probability": "%",
      "temperature_2m": "°C",
      "weather_code": "wmo code"
    },
    "hourly": {
      "time": [
        "2025-08-17T00:00", "2025-08-17T01:00", "2025-08-17T02:00", "2025-08-17T03:00",
        "2025-08-17T04:00", "2025-08-17T05:00", "2025-08-17T06:00", "2025-08-17T07:00",
        "2025-08-17T08:00", "2025-08-17T09:00", "2025-08-17T10:00", "2025-08-17T11:00",
        "2025-08-17T12:00", "2025-08-17T13:00", "2025-08-17T14:00", "2025-08-17T15:00",
        "2025-08-17T16:00", "2025-08-17T17:00", "2025-08-17T18:00", "2025-08-17T19:00",
        "2025-08-17T20:00", "2025-08-17T21:00", "2025-08-17T22:00", "2025-08-17T23:00"
      ],
      "precipitation_probability": [
        35, 28, 33, 50, 65, 73, 68, 68, 70, 68, 60, 75, 80, 83, 73, 78, 78, 65, 40, 45, 20, 13, 8, 5
      ],
      "temperature_2m": [
        27.9, 27.3, 27.1, 26.9, 26.4, 26.1, 27.2, 27.4, 27.9, 28.3, 28.4, 29.0, 29.9, 30.5, 31.2, 31.5, 30.9, 30.6, 31.3, 29.8, 29.0, 28.7, 28.4, 28.2
      ],
      "weather_code": [
        80, 95, 80, 3, 95, 95, 80, 3, 3, 95, 95, 95, 80, 80, 3, 80, 80, 3, 3, 3, 3, 3, 3, 3
      ]
    }
  };

  const weatherData = mockWeatherData; // Use the mock data for now
  const loading = false;
  const error = null;

  // Render a loading spinner if the data is being fetched
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  // Render an error message if there's an issue with the API call
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error fetching weather data: {error.message}
        </Text>
      </View>
    );
  }

  // Check if weatherData is null or empty, which can happen after a failed fetch
  if (!weatherData || !weatherData.current_weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No weather data available.</Text>
      </View>
    );
  }

  // Destructure the data for easier access
  const { current_weather, current_weather_units, hourly } = weatherData;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.mainContainer}>
        {/* Header and Current Weather Display */}
        <View style={styles.currentWeatherContainer}>
          <Text style={styles.timezoneText}>{weatherData.timezone}</Text>
          <Text style={styles.temperatureText}>
            {current_weather.temperature}
            {current_weather_units.temperature}
          </Text>
          <Text style={styles.weatherDescription}>
            {getWeatherCodeDescription(current_weather.weathercode)}
          </Text>
          <View style={styles.windContainer}>
            <Text style={styles.windText}>
              Wind: {current_weather.windspeed}
              {current_weather_units.windspeed}
            </Text>
            <Text style={styles.windText}>
              Direction: {current_weather.winddirection}
              {current_weather_units.winddirection}
            </Text>
          </View>
        </View>

        {/* Hourly Forecast Section */}
        <View style={styles.hourlyContainer}>
          <Text style={styles.hourlyTitle}>Hourly Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {hourly.time.slice(0, 24).map((time, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>
                  {new Date(time).getHours()}:00
                </Text>
                <Text style={styles.hourlyTemp}>
                  {hourly.temperature_2m[index]}
                  {hourly.hourly_units?.temperature_2m || '°C'}
                </Text>
                <Text style={styles.hourlyPrecipitation}>
                  {hourly.precipitation_probability[index]}
                  {hourly.hourly_units?.precipitation_probability || '%'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Stylesheet for the component
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  currentWeatherContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  timezoneText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  temperatureText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  weatherDescription: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
  },
  windContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  windText: {
    fontSize: 14,
    color: '#888',
  },
  hourlyContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  hourlyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  hourlyItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  hourlyTime: {
    fontSize: 14,
    color: '#888',
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  hourlyPrecipitation: {
    fontSize: 14,
    color: '#007bff',
  },
});

export default WeatherDisplay;
