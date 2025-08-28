/** Typy pro navigaci v aplikaci */
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Typy pro Stack Navigator */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Prehled: undefined;
  Vydaje: undefined;
  Prijmy: undefined;
  VydajePrehled: undefined;
  Poznamky: undefined;
  PrijmyVydaje: undefined;
};

/** Typy pro Bottom Tab Navigator */
export type TabParamList = {
  ZboziTab: undefined;
  VydajeTab: undefined;
  PrehledTab: undefined;
  PoznamkyTab: undefined;
};

// Navigační typy pro komponenty
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >; 