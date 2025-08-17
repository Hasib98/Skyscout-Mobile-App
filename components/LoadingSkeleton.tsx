import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  isDarkMode: boolean;
}

const LoadingSkeleton = ({ isDarkMode }: Props) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const skeletonColor = isDarkMode ? '#334155' : '#F1F5F9';
  const highlightColor = isDarkMode ? '#475569' : '#E2E8F0';
  const backgroundColor = isDarkMode ? '#1E293B' : '#FFFFFF';
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const interpolatedColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [skeletonColor, highlightColor],
  });

  const shimmerOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.7, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor }]} accessibilityLabel="Loading weather data">
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Animated.View
          style={[
            styles.locationSkeleton,
            { 
              backgroundColor: interpolatedColor,
              opacity: shimmerOpacity 
            },
          ]}
        />
        
        <View style={styles.temperatureSection}>
          <Animated.View
            style={[
              styles.mainTemperatureSkeleton,
              { 
                backgroundColor: interpolatedColor,
                opacity: shimmerOpacity 
              },
            ]}
          />
          
          <Animated.View
            style={[
              styles.conditionSkeleton,
              { 
                backgroundColor: interpolatedColor,
                opacity: shimmerOpacity 
              },
            ]}
          />
        </View>
        
        {/* Current stats row */}
        <View style={styles.statsRow}>
          {[...Array(3)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statItemSkeleton,
                { 
                  backgroundColor: interpolatedColor,
                  opacity: shimmerOpacity 
                },
              ]}
            />
          ))}
        </View>
      </View>
      
      {/* Forecast Section */}
      <View style={styles.forecastSection}>
        <Animated.View
          style={[
            styles.sectionTitleSkeleton,
            { 
              backgroundColor: interpolatedColor,
              opacity: shimmerOpacity 
            },
          ]}
        />
        
        <View style={styles.hourlyGrid}>
          {[...Array(8)].map((_, index) => (
            <View key={index} style={styles.hourlyCardContainer}>
              <Animated.View
                style={[
                  styles.timeSlotSkeleton,
                  { 
                    backgroundColor: interpolatedColor,
                    opacity: shimmerOpacity 
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.weatherIconSkeleton,
                  { 
                    backgroundColor: interpolatedColor,
                    opacity: shimmerOpacity 
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.hourlyTempSkeleton,
                  { 
                    backgroundColor: interpolatedColor,
                    opacity: shimmerOpacity 
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
      
      {/* Daily Forecast Section */}
      <View style={styles.dailySection}>
        <Animated.View
          style={[
            styles.sectionTitleSkeleton,
            { 
              backgroundColor: interpolatedColor,
              opacity: shimmerOpacity 
            },
          ]}
        />
        
        <View style={styles.dailyList}>
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.dailyItemContainer}>
              <Animated.View
                style={[
                  styles.dayNameSkeleton,
                  { 
                    backgroundColor: interpolatedColor,
                    opacity: shimmerOpacity 
                  },
                ]}
              />
              <View style={styles.dailyRightSection}>
                <Animated.View
                  style={[
                    styles.dailyIconSkeleton,
                    { 
                      backgroundColor: interpolatedColor,
                      opacity: shimmerOpacity 
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.dailyTempSkeleton,
                    { 
                      backgroundColor: interpolatedColor,
                      opacity: shimmerOpacity 
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  locationSkeleton: {
    height: 24,
    width: 180,
    borderRadius: 12,
    marginBottom: 24,
  },
  temperatureSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  mainTemperatureSkeleton: {
    height: 72,
    width: 160,
    borderRadius: 16,
    marginBottom: 12,
  },
  conditionSkeleton: {
    height: 20,
    width: 140,
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItemSkeleton: {
    height: 48,
    width: 80,
    borderRadius: 12,
  },
  
  // Forecast Section
  forecastSection: {
    marginBottom: 32,
  },
  sectionTitleSkeleton: {
    height: 22,
    width: 120,
    borderRadius: 11,
    marginBottom: 16,
  },
  hourlyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  hourlyCardContainer: {
    alignItems: 'center',
    width: '12%',
    paddingVertical: 12,
  },
  timeSlotSkeleton: {
    height: 16,
    width: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  weatherIconSkeleton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  hourlyTempSkeleton: {
    height: 18,
    width: 28,
    borderRadius: 9,
  },
  
  // Daily Section
  dailySection: {
    marginBottom: 20,
  },
  dailyList: {
    gap: 12,
  },
  dailyItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  dayNameSkeleton: {
    height: 20,
    width: 80,
    borderRadius: 10,
  },
  dailyRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dailyIconSkeleton: {
    height: 28,
    width: 28,
    borderRadius: 14,
  },
  dailyTempSkeleton: {
    height: 20,
    width: 60,
    borderRadius: 10,
  },
});

export default LoadingSkeleton;