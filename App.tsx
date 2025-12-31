import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Import navigátoru
import { TabNavigator } from './src/navigation/TabNavigator';

// Import typů
import { RootStackParamList } from './src/types/navigation';

// Import Firebase konfigurace
import { configureFirestore } from './src/config/firebase';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * @description Hlavní komponenta aplikace s navigací a Firebase real-time synchronizací.
 */
export default function App() {
  // Inicializace Firebase offline persistence při spuštění
  useEffect(() => {
    configureFirestore();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <TabNavigator />
    </NavigationContainer>
  );
}
