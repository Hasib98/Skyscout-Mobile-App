import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocationManager } from './hooks/useLocationManager';

import LoadingSkeleton from './components/LoadingSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorState from './components/ErrorState';
import WeatherDisplay from './components/WeatherDisplay';
import CitySearch from './components/CitySearch';

type Coords = {
  lat: number,
  lon: number
}
  const App = () => {
    const { state } = useLocationManager();
    const [searchData , setSearchData] = useState(null);

    function handleSaveCity(data :any){
      setSearchData({ lat: data.latitude, lon:  data.longitude});
    }

    if (searchData ) {
      return  <WeatherDisplay lat={searchData.lat} lon = {searchData.lon}/> ;
    }

  

    if (state.status === 'denied') {
      return <CitySearch onSelectCity={handleSaveCity}/>;
    }

    if (state.status === 'loading') return <LoadingSkeleton isDarkMode={true}/>

    if (state.status === 'error') return <ErrorState/>
      
      /* {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <Text>Error: {state.message}</Text>
        </View>
      );
    } */

    if (state.status === 'coords' ) {
      return  <WeatherDisplay lat={state.lat} lon = {state.lon}/> ;
    }

    if (state.status === 'city') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <Text>Saved city: {state.name}</Text>
          <Text>Latitude: {state.lat}</Text>
          <Text>Longitude: {state.lon}</Text>
        </View>
      );
    }

    return null;
  };


  const styles = StyleSheet.create({
    button: {
      backgroundColor: '#8A4DFF',      // purple background
      borderWidth: 2,                  // white border thickness
      borderColor: '#FFFFFF',          // white border color
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 25,                // pill-shaped
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',                // white text
      fontSize: 16,
      fontWeight: '600',
    },
  });

  export default App;
