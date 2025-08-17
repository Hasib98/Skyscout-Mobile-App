// components/CitySearch.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { apiService } from '../services/api';

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
    onSelectCity(city);
    setSearchQuery(''); // Clear search after selection
    setResults([]);     // Clear results after selection
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
  };

  const renderCityItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultItem}
      activeOpacity={0.8}
      onPress={() => handleCitySelect(item)}
      accessibilityLabel={`Select ${formatCityDisplay(item)}`}
      accessibilityRole="button"
    >
      <View style={styles.resultContent}>
        <View style={styles.cityIconContainer}>
          <Text style={styles.cityIcon}>🏙️</Text>
        </View>
        <View style={styles.cityInfoContainer}>
          <Text style={styles.cityName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.locationDetails} numberOfLines={1}>
            {[item.admin1, item.country].filter(Boolean).join(', ')}
          </Text>
        </View>
      </View>
      
      {/* Optional: Show coordinates for debugging */}
     {/*  {__DEV__ && (
        <Text style={styles.coordinatesText}>
          {item.latitude?.toFixed(2)}, {item.longitude?.toFixed(2)}
        </Text>
      )} */}
      {/* {__DEV__ && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            {item.latitude?.toFixed(2)}, {item.longitude?.toFixed(2)}
          </Text>
        </View>
      )} */}
    </TouchableOpacity>
  );

  const showResults = searchQuery.length >= 2 && results.length > 0;
  const showNoResults = searchQuery.length >= 2 && !loading && results.length === 0 && !error;

  return (
    <View style={styles.container}>
      {/* Gradient Background Overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <View style={styles.searchIconContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <TextInput
            style={[
              styles.searchInput,
              // Adjust padding to make room for loader and clear button
              Platform.OS === 'android' && {
                paddingRight: searchQuery.length > 0 ? (loading ? 90 : 70) : 50
              }
            ]}
            value={searchQuery}
            placeholder={placeholder}
            placeholderTextColor="#8B9DC3"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            onChangeText={setSearchQuery}
            clearButtonMode={Platform.OS === 'ios' ? "while-editing" : "never"}
            accessibilityLabel="City search input"
            accessibilityHint="Type at least 2 characters to search for cities"
          />
          
          {/* Loading Indicator - Inside the input field */}
          {loading && (
            <View style={styles.loadingIndicator}>
              <View style={styles.pulsingDot}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            </View>
          )}
          
          {/* Android Clear Button - Inside the input field */}
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
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                if (searchQuery.length >= 2) {
                  // Trigger search again
                  setSearchQuery(searchQuery + ' ');
                  setTimeout(() => setSearchQuery(searchQuery), 100);
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Results List */}
      {showResults && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeaderContainer}>
            <View style={styles.resultsHeaderContent}>
              <View style={styles.resultsIconContainer}>
                <Text style={styles.resultsIcon}>📍</Text>
              </View>
              <Text style={styles.resultsHeader}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          </View>
          <FlatList
            data={results}
            renderItem={renderCityItem}
            keyExtractor={(item, index) => `city-${item.id || index}-${item.latitude}-${item.longitude}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* No Results Message */}
      {showNoResults && (
        <View style={styles.noResultsContainer}>
          <View style={styles.noResultsIconContainer}>
            <Text style={styles.noResultsIcon}>🌍</Text>
            <View style={styles.noResultsIconGlow} />
          </View>
          <Text style={styles.noResultsText}>
            No cities found for "{searchQuery}"
          </Text>
          <Text style={styles.noResultsSubtext}>
            Try searching with a different spelling or check for typos
          </Text>
        </View>
      )}

      {/* Search Instructions */}
      {searchQuery.length === 0 && (
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsIconContainer}>
            <Text style={styles.instructionsIcon}>✨</Text>
            <View style={styles.instructionsIconGlow} />
          </View>
          <Text style={styles.instructionsText}>
            Discover cities around the world
          </Text>
          <Text style={styles.instructionsSubtext}>
            Start typing to explore amazing destinations
          </Text>
        </View>
      )}

      {/* Minimum Character Notice */}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsIconContainer}>
            <Text style={styles.instructionsIcon}>⌨️</Text>
            <View style={styles.instructionsIconGlow} />
          </View>
          <Text style={styles.instructionsText}>
            Keep typing...
          </Text>
          <Text style={styles.instructionsSubtext}>
            Just a few more characters to start the magic
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'transparent',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconContainer: {
    position: 'absolute',
    left: 20,
    zIndex: 2,
    height: 60,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    height: 60,
    paddingHorizontal: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    fontSize: 17,
    color: '#FFFFFF',
    backdropFilter: 'blur(20px)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    ...Platform.select({
      ios: { 
        paddingVertical: 16,
      },
      android: { 
        paddingVertical: 14,
      },
    }),
  },
  loadingIndicator: {
    position: 'absolute',
    right: 20,
    height: 60,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(103, 126, 234, 0.8)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#677eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 16,
  },
  errorContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backdropFilter: 'blur(20px)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  errorIconContainer: {
    marginRight: 12,
  },
  errorIcon: {
    fontSize: 24,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    color: '#FEF2F2',
    fontSize: 15,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 15,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    marginHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  resultsHeaderContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsIconContainer: {
    marginRight: 12,
  },
  resultsIcon: {
    fontSize: 18,
  },
  resultsHeader: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContainer: {
    paddingVertical: 12,
  },
  resultItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  cityIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(103, 126, 234, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(103, 126, 234, 0.3)',
  },
  cityIcon: {
    fontSize: 20,
  },
  cityInfoContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 24,
  },
  locationDetails: {
    fontSize: 14,
    color: '#A0AEC0',
    lineHeight: 20,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(103, 126, 234, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(103, 126, 234, 0.4)',
  },
  arrow: {
    fontSize: 18,
    color: '#E2E8F0',
    fontWeight: '600',
  },
    coordinatesContainer: {
    marginTop: 4,
    marginLeft: 80, // align with city name start (icon width + margin)
  },
 /*  coordinatesText: {
    fontSize: 12,
    color: '#718096',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }, */
  coordinatesText: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    fontSize: 10,
    color: '#718096',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  noResultsIconContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  noResultsIconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 50,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  noResultsIcon: {
    fontSize: 40,
    zIndex: 2,
  },
  noResultsText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  noResultsSubtext: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: '500',
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  instructionsIconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    backgroundColor: 'rgba(103, 126, 234, 0.15)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(103, 126, 234, 0.3)',
  },
  instructionsIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: 'rgba(103, 126, 234, 0.1)',
    borderRadius: 60,
    shadowColor: '#677eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 12,
  },
  instructionsIcon: {
    fontSize: 48,
    zIndex: 2,
  },
  instructionsText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '800',
    marginBottom: 12,
    maxWidth: 320,
  },
  instructionsSubtext: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    fontWeight: '500',
  },
});

export default CitySearch;