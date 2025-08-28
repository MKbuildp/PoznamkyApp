import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Import navigátoru
import { TabNavigator } from './src/navigation/TabNavigator';

// Import typů
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * @description Hlavní komponenta aplikace s navigací.
 */
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <TabNavigator />
    </NavigationContainer>
  );
}
