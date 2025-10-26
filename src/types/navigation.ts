/** Typy pro navigaci v aplikaci */
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Typy pro Stack Navigator */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Prehled: undefined;
  WaxDream: undefined;
  Prijmy: undefined;
  Poznamky: undefined;
  PrijmyVydaje: undefined;
  ObchodPrehled: { mesic: number; rok: number };
};

/** Typy pro Bottom Tab Navigator */
export type TabParamList = {
  WaxDreamTab: undefined;
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