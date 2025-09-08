/** PrijmyScreen - Obrazovka pro správu příjmů */
import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, RefreshControl } from 'react-native';
import { FormularPrijmu } from './components/FormularPrijmu';
import { usePrijmy } from './hooks/usePrijmy';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';


type Props = NativeStackScreenProps<RootStackParamList, 'Prijmy'>;

/**
 * @description Hlavní obrazovka pro zadávání příjmů
 */
export const PrijmyScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { synchronizujZFirestore } = useFirestoreSync();
  const { state, handlers, utils } = usePrijmy();

  /**
   * @description Funkce pro aktualizaci dat při pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Synchronizace z Firebase
      await synchronizujZFirestore();
      // Aktualizace lokálních dat
      await utils.nactiRocniPrijem();
    } catch (error) {
      console.error('Chyba při aktualizaci dat:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']} // Android
          tintColor="#007AFF" // iOS
          title="Aktualizace dat z Firebase..."
          titleColor="#666"
        />
      }
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <FormularPrijmu
          castka={state.castka}
          datum={state.datum}
          isDatePickerVisible={state.isDatePickerVisible}
          isLoading={state.isLoading}
          onCastkaChange={handlers.handleCastkaChange}
          onDatumChange={handlers.handleDatumChange}
          onSubmit={handlers.handleSubmit}
          onDatePickerVisibilityChange={handlers.handleDatePickerVisibilityChange}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardContainer: {
    padding: 8,
  }
}); 