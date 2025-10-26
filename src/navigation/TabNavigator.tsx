import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Dimensions } from 'react-native';

// Import obrazovek
import { PrehledScreen } from '../screens/Prehled/PrehledScreen';
import { WaxDreamScreen } from '../screens/WaxDream/WaxDreamScreen';
import { PrijmyVydajeScreen } from '../screens/PrijmyVydaje/PrijmyVydajeScreen';
import PoznamkyScreen from '../screens/Poznamky/PoznamkyScreen';

// Import typů
import { TabParamList, RootStackParamList } from '../types/navigation';

/**
 * @description Konstanty pro názvy tabů s vysvětlením
 * Poznámka: Názvy tabů neodpovídají zobrazovanému textu v tab baru
 * 
 * DŮLEŽITÉ: Tab PRIJMY se zobrazuje jako "Koloniál" - obsahuje funkcionalitu příjmů a výdajů
 */
const TAB_NAMES = {
  WAXDREAM: 'WaxDreamTab', // Zobrazuje "WaxDream" v tab baru
  PRIJMY: 'VydajeTab', // Zobrazuje "Koloniál" v tab baru (obsahuje příjmy + výdaje)
  PREHLED: 'PrehledTab', // Zobrazuje "Přehled" v tab baru
  DOMACNOST: 'PoznamkyTab' // Zobrazuje "Domácnost" v tab baru
} as const;

// Stack navigátory pro každý tab
const WaxDreamStack = createNativeStackNavigator<RootStackParamList>();
const VydajeStack = createNativeStackNavigator<RootStackParamList>();
const PrehledStack = createNativeStackNavigator<RootStackParamList>();
const PoznamkyStack = createNativeStackNavigator<RootStackParamList>();

// Komponenty pro jednotlivé záložky
const WaxDreamStackScreen = () => (
  <WaxDreamStack.Navigator screenOptions={{ headerShown: false }}>
    <WaxDreamStack.Screen name="WaxDream" component={WaxDreamScreen} />
  </WaxDreamStack.Navigator>
);

/**
 * @description Stack navigátor pro tab Koloniál (původně Příjmy)
 * Obsahuje PrijmyVydajeScreen s funkcionalitou příjmů a výdajů
 */
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
      initialRouteName={TAB_NAMES.DOMACNOST}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === TAB_NAMES.WAXDREAM) {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === TAB_NAMES.PRIJMY) {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === TAB_NAMES.PREHLED) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === TAB_NAMES.DOMACNOST) {
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
        name={TAB_NAMES.WAXDREAM} 
        component={WaxDreamStackScreen} 
        options={{ 
          title: 'WaxDream',
          tabBarLabel: 'WaxDream'
        }} 
      />
      {/* Tab Koloniál - obsahuje funkcionalitu příjmů a výdajů */}
      <Tab.Screen 
        name={TAB_NAMES.PRIJMY} 
        component={VydajeStackScreen} 
        options={{ 
          title: 'Koloniál',
          tabBarLabel: 'Koloniál'
        }} 
      />
      <Tab.Screen 
        name={TAB_NAMES.PREHLED} 
        component={PrehledStackScreen}
        options={{ 
          title: 'Přehled',
          tabBarLabel: 'Přehled'
        }} 
      />
      <Tab.Screen 
        name={TAB_NAMES.DOMACNOST} 
        component={PoznamkyStackScreen} 
        options={{ 
          title: 'Domácnost',
          tabBarLabel: 'Domácnost'
        }} 
      />
    </Tab.Navigator>
  );
}; 