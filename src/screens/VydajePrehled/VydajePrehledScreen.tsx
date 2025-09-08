/** VydajePrehledScreen - Obrazovka pro přehled výdajů */
import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { DodavateleTabulka } from './components/DodavateleTabulka';
import { VydajeSeznam } from './components/VydajeSeznam';
import { FormularVydaju } from './components/FormularVydaju';
import { useVydajePrehled } from './hooks/useVydajePrehled';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';

type Props = NativeStackScreenProps<RootStackParamList, 'VydajePrehled'>;

/**
 * @description Obrazovka pro zobrazení přehledu výdajů s tabulkou
 */
export const VydajePrehledScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { synchronizujZFirestore } = useFirestoreSync();
  
  const { 
    vydajePodleDodavatelu, 
    vydaje,
    vybranyMesic,
    vybranyRok, 
    nacitaSe,
    zmenitMesic, 
    formatujCastku,
    getNazevMesice,
    nactiData,
    formular,
    onCastkaChange,
    onDatumChange,
    onKategorieChange,
    onDodavatelChange,
    onSubmit,
    onDatePickerVisibilityChange,
    smazatPosledniVydaj
  } = useVydajePrehled();

  /**
   * @description Funkce pro aktualizaci dat při pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Synchronizace z Firebase
      await synchronizujZFirestore();
      // Aktualizace lokálních dat
      await nactiData(vybranyMesic, vybranyRok);
    } catch (error) {
      console.error('Chyba při aktualizaci dat:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Zobrazujeme pouze seznam výdajů
  const renderObsah = () => {
    return (
      <VydajeSeznam
        vydaje={vydaje}
        vybranyMesic={vybranyMesic}
        vybranyRok={vybranyRok}
        nacitaSe={nacitaSe}
        zmenitMesic={zmenitMesic}
        formatujCastku={formatujCastku}
        getNazevMesice={getNazevMesice}
      />
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
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
        castka={formular.castka}
        datum={formular.datum}
        kategorie={formular.kategorie}
        dodavatel={formular.dodavatel}
        isDatePickerVisible={formular.isDatePickerVisible}
        isLoading={formular.isLoading}
        onCastkaChange={onCastkaChange}
        onDatumChange={onDatumChange}
        onKategorieChange={onKategorieChange}
        onDodavatelChange={onDodavatelChange}
        onSubmit={onSubmit}
        onDatePickerVisibilityChange={onDatePickerVisibilityChange}
      />

      {/* Tlačítko pro smazání posledního výdaje */}
      <TouchableOpacity 
        style={styles.smazatTlacitko}
        onPress={smazatPosledniVydaj}
      >
        <Text style={styles.smazatTlacitkoText}>🗑️ Smazat poslední výdaj</Text>
      </TouchableOpacity>
      
      {/* Seznam výdajů */}
      {renderObsah()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 80, // Prostor pro Tab Bar
  },
  smazatTlacitko: {
    backgroundColor: '#FF5252',
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  smazatTlacitkoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 