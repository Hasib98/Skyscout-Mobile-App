// hooks/useWeather.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface WeatherData {
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

export const useWeather = (lat: number, lon: number) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!lat || !lon) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.weather.getCurrentWeather(lat, lon);
      setWeatherData(data);
    } catch (e) {
      setError('Failed to load weather. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [lat, lon]);

  return { weatherData, loading, error, refetch: fetchWeather };
};
