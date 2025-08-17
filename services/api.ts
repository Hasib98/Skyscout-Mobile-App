import axios from 'axios';

// API Base URLs
export const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';
export const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

// API Endpoints
export const API_ENDPOINTS = {
  WEATHER: {
    FORECAST: '/forecast',
  },
  GEOCODING: {
    SEARCH: '/search',
  },
};

// Create axios instances
const weatherApi = axios.create({
  baseURL: WEATHER_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const geocodingApi = axios.create({
  baseURL: GEOCODING_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptors
weatherApi.interceptors.request.use(
  (config) => {
    console.log(`🌤️  Weather API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Weather API Request Error:', error);
    return Promise.reject(error);
  }
);

geocodingApi.interceptors.request.use(
  (config) => {
    console.log(`🌍 Geocoding API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Geocoding API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptors
weatherApi.interceptors.response.use(
  (response) => {
    console.log(`Weather API Response: ${response.status}`);
    return response.data;
  },
  (error) => {
    console.error('Weather API Error:', error.response?.status, error.message);
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('Invalid weather API request parameters');
        case 429:
          throw new Error('Too many weather API requests. Please try again later.');
        case 500:
          throw new Error('Weather service is temporarily unavailable');
        default:
          throw new Error(`Weather API error: ${error.response.status}`);
      }
    }
    throw new Error('Network error. Please check your internet connection.');
  }
);

geocodingApi.interceptors.response.use(
  (response) => {
    console.log(`Geocoding API Response: ${response.status}`);
    return response.data;
  },
  (error) => {
    console.error('Geocoding API Error:', error.response?.status, error.message);
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('Invalid search query');
        case 429:
          throw new Error('Too many search requests. Please try again later.');
        case 500:
          throw new Error('Search service is temporarily unavailable');
        default:
          throw new Error(`Search error: ${error.response.status}`);
      }
    }
    throw new Error('Network error. Please check your internet connection.');
  }
);

export { weatherApi, geocodingApi };

// Generic API methods for extensibility
export const apiService = {
  // Weather API methods
  weather: {
    getCurrentWeather: (latitude: number, longitude: number) => 
      weatherApi.get(API_ENDPOINTS.WEATHER.FORECAST, {
        params: {
          latitude,
          longitude,
          current_weather: true,
          hourly: 'precipitation_probability,temperature_2m',
          forecast_days: 1,
          timezone: 'auto',
        }
      }),
  },

  // Geocoding API methods
  geocoding: {
    searchCities: (query: string) =>
      geocodingApi.get(API_ENDPOINTS.GEOCODING.SEARCH, {
        params: {
          name: query,
          count: 5,
          language: 'en',
          format: 'json',
        }
      }),
  },

  // Generic methods for other endpoints
  get: (endpoint: string, params = {}) => weatherApi.get(endpoint, { params }),
  post: (endpoint: string, data = {}) => weatherApi.post(endpoint, data),
  put: (endpoint: string, data = {}) => weatherApi.put(endpoint, data),
  delete: (endpoint: string) => weatherApi.delete(endpoint),
  patch: (endpoint: string, data = {}) => weatherApi.patch(endpoint, data),
};