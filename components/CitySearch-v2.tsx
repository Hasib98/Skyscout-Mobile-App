// components/CitySearch.tsx
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';

const { width, height } = Dimensions.get('window');

interface CitySearchProps {
  placeholder?: string;
  onSelectCity: (city: any) => void;
  showRecentSearches?: boolean;
}

const CitySearch = ({
  placeholder = 'Search for a city...',
  onSelectCity,
  showRecentSearches = true,
} : CitySearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.geocoding.searchCities(searchQuery);
        console.log('API Response:', response);
        
        // Handle the response structure based on your API service
        const cityResults = response?.results || response?.data?.results || [];
        setResults(cityResults);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Format city name as "City, State/Province, Country"
  const formatCityDisplay = (city: any) => {
    const parts = [];
    
    if (city.name) parts.push(city.name);
    if (city.admin1) parts.push(city.admin1);
    if (city.country) parts.push(city.country);
    
    return parts.join(', ');
  };

  const handleCitySelect = (city: any) => {
    console.log('Selected city:', city);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onSelectCity(city);
    setSearchQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    
    // Animate clear
    Animated.spring(inputScaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(inputScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    Animated.spring(inputScaleAnim, {
      toValue: 1.02,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    Animated.spring(inputScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const renderCityItem = ({ item, index }: { item: any; index: number }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [{
            translateY: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }]
        }}
      >
        <TouchableOpacity
          style={styles.resultItem}
          activeOpacity={0.8}
          onPress={() => handleCitySelect(item)}
          accessibilityLabel={`Select ${formatCityDisplay(item)}`}
          accessibilityRole="button"
        >
          <View style={styles.cityIconContainer}>
            <Text style={styles.cityIcon}>📍</Text>
          </View>
          
          <View style={styles.resultContent}>
            <Text style={styles.cityName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.locationDetails} numberOfLines={1}>
              {[item.admin1, item.country].filter(Boolean).join(', ')}
            </Text>
          </View>
          
          <View style={styles.selectIndicator}>
            <Text style={styles.selectArrow}>→</Text>
          </View>
          
          {/* Optional: Show coordinates for debugging */}
          {__DEV__ && (
            <Text style={styles.coordinatesText}>
              {item.latitude?.toFixed(2)}, {item.longitude?.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const showResults = searchQuery.length >= 2 && results.length > 0;
  const showNoResults = searchQuery.length >= 2 && !loading && results.length === 0 && !error;

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View 
            style={[
              styles.mainContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Choose Location</Text>
              <Text style={styles.headerSubtitle}>Search for cities worldwide</Text>
            </View>

            {/* Search Input */}
            <Animated.View 
              style={[
                styles.searchContainer,
                { transform: [{ scale: inputScaleAnim }] }
              ]}
            >
              <View style={[
                styles.inputWrapper,
                isInputFocused && styles.inputWrapperFocused
              ]}>
                <View style={styles.searchIconContainer}>
                  <Text style={styles.searchIcon}>🔍</Text>
                </View>
                
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  placeholder={placeholder}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                  onChangeText={setSearchQuery}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  clearButtonMode={Platform.OS === 'ios' ? "while-editing" : "never"}
                  accessibilityLabel="City search input"
                  accessibilityHint="Type at least 2 characters to search for cities"
                />
                
                {/* Loading Indicator */}
                {loading && (
                  <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
                  </View>
                )}
                
                {/* Android Clear Button */}
                {Platform.OS === 'android' && searchQuery.length > 0 && !loading && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearSearch}
                    accessibilityLabel="Clear search"
                    accessibilityRole="button"
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* Error Message */}
            {error && (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 15],
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.errorContent}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => {
                        setError(null);
                        if (searchQuery.length >= 2) {
                          setSearchQuery(searchQuery + ' ');
                          setTimeout(() => setSearchQuery(searchQuery), 100);
                        }
                      }}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Search Results */}
            {showResults && (
              <Animated.View style={styles.resultsContainer}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsHeaderText}>
                    {results.length} location{results.length !== 1 ? 's' : ''} found
                  </Text>
                </View>
                
                <FlatList
                  data={results}
                  renderItem={renderCityItem}
                  keyExtractor={(item, index) => `city-${item.id || index}-${item.latitude}-${item.longitude}`}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.listContainer}
                />
              </Animated.View>
            )}

            {/* No Results */}
            {showNoResults && (
              <Animated.View style={styles.noResultsContainer}>
                <View style={styles.illustrationContainer}>
                  <Text style={styles.illustrationEmoji}>🌍</Text>
                  <Text style={styles.illustrationText}>No Results</Text>
                </View>
                <Text style={styles.noResultsText}>
                  No cities found for "{searchQuery}"
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Try a different spelling or search term
                </Text>
              </Animated.View>
            )}

            {/* Search Instructions */}
            {searchQuery.length === 0 && (
              <Animated.View style={styles.instructionsContainer}>
                <View style={styles.illustrationContainer}>
                  <Text style={styles.illustrationEmoji}>🗺️</Text>
                  <Text style={styles.illustrationText}>Explore</Text>
                </View>
                <Text style={styles.instructionsTitle}>
                  Discover Cities Worldwide
                </Text>
                <Text style={styles.instructionsText}>
                  Start typing to search for cities, towns, and locations around the globe
                </Text>
              </Animated.View>
            )}

            {/* Minimum Character Notice */}
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <Animated.View style={styles.instructionsContainer}>
                <View style={styles.illustrationContainer}>
                  <Text style={styles.illustrationEmoji}>✏️</Text>
                  <Text style={styles.illustrationText}>Keep Typing</Text>
                </View>
                <Text style={styles.instructionsTitle}>
                  Almost There!
                </Text>
                <Text style={styles.instructionsText}>
                  Type at least 2 characters to start searching
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#74b9ff',
  },
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  searchContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 20,
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    ...Platform.select({
      ios: { paddingVertical: 0 },
      android: { paddingVertical: 0 },
    }),
  },
  loadingIndicator: {
    marginLeft: 12,
  },
  clearButton: {
    marginLeft: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  errorContainer: {
    marginBottom: 20,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  resultsHeaderText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cityIcon: {
    fontSize: 18,
  },
  resultContent: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
  },
  selectIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectArrow: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  illustrationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,  
    fontWeight: '400',
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default CitySearch;