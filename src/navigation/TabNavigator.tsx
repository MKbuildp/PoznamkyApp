import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Dimensions } from 'react-native';

// Import obrazovek
import { PrehledScreen } from '../screens/Prehled/PrehledScreen';
import { VydajePrehledScreen } from '../screens/VydajePrehled/VydajePrehledScreen';
import { PrijmyVydajeScreen } from '../screens/PrijmyVydaje/PrijmyVydajeScreen';
import PoznamkyScreen from '../screens/Poznamky/PoznamkyScreen';

// Import typů
import { TabParamList, RootStackParamList } from '../types/navigation';

// Stack navigátory pro každý tab
const ZboziStack = createNativeStackNavigator<RootStackParamList>();
const VydajeStack = createNativeStackNavigator<RootStackParamList>();
const PrehledStack = createNativeStackNavigator<RootStackParamList>();
const PoznamkyStack = createNativeStackNavigator<RootStackParamList>();

// Komponenty pro jednotlivé záložky
const ZboziStackScreen = () => (
  <ZboziStack.Navigator screenOptions={{ headerShown: false }}>
    <ZboziStack.Screen name="VydajePrehled" component={VydajePrehledScreen} />
  </ZboziStack.Navigator>
);

const VydajeStackScreen = () => (
  <VydajeStack.Navigator screenOptions={{ headerShown: false }}>
    <VydajeStack.Screen name="PrijmyVydaje" component={PrijmyVydajeScreen} />
  </VydajeStack.Navigator>
);

const PrehledStackScreen = () => (
  <PrehledStack.Navigator screenOptions={{ headerShown: false }}>
    <PrehledStack.Screen name="Prehled" component={PrehledScreen} />
  </PrehledStack.Navigator>
);

const PoznamkyStackScreen = () => (
  <PoznamkyStack.Navigator screenOptions={{ headerShown: false }}>
    <PoznamkyStack.Screen name="Poznamky" component={PoznamkyScreen} />
  </PoznamkyStack.Navigator>
);

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * @description Komponenta pro spodní navigační lištu
 */
export const TabNavigator = () => {
  // Zjistíme výšku obrazovky
  const { height: screenHeight } = Dimensions.get('window');
  
  // Nastavíme výšku hlavičky na 9,5% celkové výšky obrazovky
  const headerHeight = screenHeight * 0.095;
  
  // Původní velikost písma byla 16, zvětšíme o 20% a zaokrouhlíme
  const headerFontSize = Math.round(16 * 1.2); // 16 * 1.2 = 19.2 → 19

  return (
    <Tab.Navigator
      initialRouteName="PoznamkyTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'ZboziTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'VydajeTab') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'PrehledTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'PoznamkyTab') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: 'white',
          height: headerHeight,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: 'black',
          fontSize: headerFontSize,
        },
      })}
    >
      <Tab.Screen 
        name="ZboziTab" 
        component={ZboziStackScreen} 
        options={{ 
          title: 'Výdaje',
          tabBarLabel: 'Výdaje'
        }} 
      />
      <Tab.Screen 
        name="VydajeTab" 
        component={VydajeStackScreen} 
        options={{ 
          title: 'Příjmy',
          tabBarLabel: 'Příjmy'
        }} 
      />
      <Tab.Screen 
        name="PrehledTab" 
        component={PrehledStackScreen}
        options={{ 
          title: 'Přehled',
          tabBarLabel: 'Přehled'
        }} 
      />
      <Tab.Screen 
        name="PoznamkyTab" 
        component={PoznamkyStackScreen} 
        options={{ 
          title: 'Domácnost',
          tabBarLabel: 'Domácnost'
        }} 
      />
    </Tab.Navigator>
  );
}; 