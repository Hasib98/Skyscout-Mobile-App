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
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';

const { width, height } = Dimensions.get('window');

interface CitySearchProps {
  placeholder?: string;
  onSelectCity: (city: any) => void;
}

const CitySearch = ({ placeholder = 'Search for a city...', onSelectCity }: CitySearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

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
        const cityResults = response?.results || response?.data?.results || [];
        setResults(cityResults);
      } catch (err: any) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleCitySelect = (city: any) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    onSelectCity(city);
    setSearchQuery('');
    setResults([]);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
  };

  const renderCityItem = ({ item, index }: { item: any; index: number }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(itemAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [{ translateY: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }}
      >
        <TouchableOpacity style={styles.resultItem} onPress={() => handleCitySelect(item)}>
          <View style={styles.cityIconContainer}>
            <Text style={styles.cityIcon}>📍</Text>
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.cityName}>{item.name}</Text>
            <Text style={styles.locationDetails}>{[item.admin1, item.country].filter(Boolean).join(', ')}</Text>
          </View>
          <View style={styles.selectIndicator}>
            <Text style={styles.selectArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const showResults = searchQuery.length >= 2 && results.length > 0;

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.mainContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Choose Location</Text>
                <Text style={styles.headerSubtitle}>Search for cities worldwide</Text>
              </View>

              <View style={[styles.inputWrapper, isInputFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={placeholder}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {loading && <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />}
                {searchQuery.length > 0 && !loading && (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showResults && (
                <FlatList
                  data={results}
                  renderItem={renderCityItem}
                  keyExtractor={(item, idx) => `${item.name}-${idx}`}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </Animated.View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#74b9ff' },
  safeArea: { flex: 1 },
  mainContainer: { flex: 1, paddingHorizontal: 20 },
  header: { paddingVertical: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '400' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 20,
  },
  inputWrapperFocused: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#fff' },
  clearButtonText: { fontSize: 14, color: '#fff', marginLeft: 12 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    marginVertical: 4,
    borderRadius: 16,
  },
  cityIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cityIcon: { fontSize: 18 },
  resultContent: { flex: 1 },
  cityName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  locationDetails: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  selectIndicator: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  selectArrow: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
});

export default CitySearch;
