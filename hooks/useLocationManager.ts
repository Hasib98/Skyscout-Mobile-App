import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

type LocationState = 
  | { status: 'loading' }
  | { status: 'coords', lat: number, lon: number }
  | { status: 'city', name: string, lat: number, lon: number }
  | { status: 'denied' }
  | { status: 'error', message: string };


export function useLocationManager() {
  const [state, setState] = useState<LocationState>({ status: 'loading' });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('lastLocation');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lon) {
          if (parsed.city) {
            setState({ status: 'city', ...parsed });
          } else {
            setState({ status: 'coords', lat: parsed.lat, lon: parsed.lon });
          }
          return;
        }
      }

  
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async pos => {
            const coords = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            };
            await AsyncStorage.setItem('lastLocation', JSON.stringify(coords));
            setState({ status: 'coords', ...coords });
          },
          err => setState({ status: 'error', message: err.message }),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setState({ status: 'denied' });
      }
    })();
  }, []);

  // Method to save a city manually
  async function saveCity(name: string, lat: number, lon: number) {
    const cityData = { name, lat, lon };
    await AsyncStorage.setItem('lastLocation', JSON.stringify(cityData));
    setState({ status: 'city', ...cityData });
  }

  return { state, saveCity  };
}
