/** VydajeScreen - Obrazovka pro správu výdajů */
import React, { useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { FormularVydaju } from './components/FormularVydaju';
import { useVydaje } from './hooks/useVydaje';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';

type Props = NativeStackScreenProps<RootStackParamList, 'Vydaje'>;

/**
 * @description Hlavní obrazovka pro zadávání a přehled výdajů
 */
export const VydajeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { synchronizujZFirestore } = useFirestoreSync();
  const { state, handlers, utils } = useVydaje();

  /**
   * @description Funkce pro aktualizaci dat při pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Synchronizace z Firebase
      await synchronizujZFirestore();
      // Aktualizace lokálních dat
      await utils.nactiRocniVydaje();
    } catch (error) {
      console.error('Chyba při aktualizaci dat:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
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
      {/* Formulář pro zadávání výdajů */}
      <FormularVydaju
        castka={state.castka}
        datum={state.datum}
        kategorie={state.kategorie}
        dodavatel={state.dodavatel}
        isDatePickerVisible={state.isDatePickerVisible}
        isLoading={state.isLoading}
        navrhovaniDodavateleViditelne={state.navrhovaniDodavateleViditelne}
        navrhyDodavatelu={state.navrhyDodavatelu}
        onCastkaChange={handlers.handleCastkaChange}
        onDatumChange={handlers.handleDatumChange}
        onKategorieChange={handlers.handleKategorieChange}
        onDodavatelChange={handlers.handleDodavatelChange}
        onDodavatelSelect={handlers.handleDodavatelSelect}
        onSubmit={handlers.handleSubmit}
        onDatePickerVisibilityChange={handlers.handleDatePickerVisibilityChange}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 8,
  },
  contentContainer: {
    paddingTop: 8,
  }
}); 