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
      activeOpacity={0.7}
      onPress={() => handleCitySelect(item)}
      accessibilityLabel={`Select ${formatCityDisplay(item)}`}
      accessibilityRole="button"
    >
      <View style={styles.resultContent}>
        <Text style={styles.cityName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.locationDetails} numberOfLines={1}>
          {[item.admin1, item.country].filter(Boolean).join(', ')}
        </Text>
      </View>
      
      {/* Optional: Show coordinates for debugging */}
      {__DEV__ && (
        <Text style={styles.coordinatesText}>
          {item.latitude?.toFixed(2)}, {item.longitude?.toFixed(2)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const showResults = searchQuery.length >= 2 && results.length > 0;
  const showNoResults = searchQuery.length >= 2 && !loading && results.length === 0 && !error;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.searchInput,
              // Adjust padding to make room for loader and clear button
              Platform.OS === 'android' && {
                paddingRight: searchQuery.length > 0 ? (loading ? 70 : 50) : 20
              }
            ]}
            value={searchQuery}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
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
              <ActivityIndicator size="small" color="#3B82F6" />
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
            <Text style={styles.errorText}>{error}</Text>
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
            <Text style={styles.resultsHeader}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </Text>
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
            <Text style={styles.noResultsIcon}>🔍</Text>
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
            <Text style={styles.instructionsIcon}>🌍</Text>
          </View>
          <Text style={styles.instructionsText}>
            Start typing to search for cities around the world
          </Text>
        </View>
      )}

      {/* Minimum Character Notice */}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsIconContainer}>
            <Text style={styles.instructionsIcon}>✏️</Text>
          </View>
          <Text style={styles.instructionsText}>
            Type at least 2 characters to start searching
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: { 
        paddingVertical: 14,
        paddingRight: 60, // Space for potential loader + built-in clear
      },
      android: { 
        paddingVertical: 12,
        // Android padding handled dynamically above
      },
    }),
  },
  loadingIndicator: {
    position: 'absolute',
    right: 18,
    height: 52,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 50,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    lineHeight: 16,
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  resultsHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultsHeader: {
    fontSize: 13,
    color: '#64748B',
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
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  resultContent: {
    flex: 1,
  },
  cityName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    lineHeight: 22,
  },
  locationDetails: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '400',
  },
  coordinatesText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  noResultsIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F1F5F9',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noResultsIcon: {
    fontSize: 28,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  noResultsSubtext: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  instructionsIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#EFF6FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionsIcon: {
    fontSize: 32,
  },
  instructionsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: '400',
  },
});

export default CitySearch;