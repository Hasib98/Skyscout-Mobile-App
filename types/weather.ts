// Add these TypeScript interfaces to make your API even better

import { API_ENDPOINTS, geocodingApi, weatherApi } from "../services/api";


export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
}

export interface HourlyWeather {
  time: string[];
  precipitation_probability: number[];
}

export interface WeatherResponse {
  current_weather: CurrentWeather;
  hourly: HourlyWeather;
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
}

export interface GeocodingLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
  admin2?: string; // County/District
  timezone?: string;
}

 interface GeocodingResponse {
  results?: GeocodingLocation[];
}


export interface WeatherData {
  latitude: number;
  longitude: number;
  current_weather: {
    time: string;
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    precipitation_probability: number[];
    temperature_2m: number[];
    weather_code: number[];
  };
}

export interface WeatherDisplayProps {
  weatherData: WeatherData;
  latitude: number;
  longitude: number;
}
// Improved API service with better typing
export const apiService = {
  weather: {
    getCurrentWeather: (latitude: number, longitude: number): Promise<WeatherResponse> => 
      weatherApi.get(API_ENDPOINTS.WEATHER.FORECAST, {
        params: {
          latitude,
          longitude,
          current_weather: true,
          hourly: 'precipitation_probability',
          forecast_days: 1,
          timezone: 'auto',
        }
      }),
  },

  geocoding: {
    searchCities: (query: string): Promise<GeocodingResponse> =>
      geocodingApi.get(API_ENDPOINTS.GEOCODING.SEARCH, {
        params: {
          name: query,
          count: 5,
          language: 'en',
          format: 'json',
        }
      }),
  },
}

// Optional: Add weather code to description mapping
export const WEATHER_CODES = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '❄️' },
  75: { description: 'Heavy snow fall', icon: '❄️' },
  77: { description: 'Snow grains', icon: '❄️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
} as const;