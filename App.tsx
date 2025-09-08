import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Import navigátoru
import { TabNavigator } from './src/navigation/TabNavigator';

// Import typů
import { RootStackParamList } from './src/types/navigation';

// Import Firebase konfigurace
import './src/config/firebase';

// Import synchronizačního hooku
import { useFirestoreSync } from './src/hooks/useFirestoreSync';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * @description Hlavní komponenta aplikace s navigací a Firebase synchronizací.
 */
export default function App() {
  // Inicializace Firebase synchronizace
  const { isSyncing, syncError, lastSyncTime } = useFirestoreSync();

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <TabNavigator />
    </NavigationContainer>
  );
}
