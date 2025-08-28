/** VydajePrehledScreen - Obrazovka pro přehled výdajů */
import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { DodavateleTabulka } from './components/DodavateleTabulka';
import { VydajeSeznam } from './components/VydajeSeznam';
import { FormularVydaju } from './components/FormularVydaju';
import { useVydajePrehled } from './hooks/useVydajePrehled';

type Props = NativeStackScreenProps<RootStackParamList, 'VydajePrehled'>;

/**
 * @description Obrazovka pro zobrazení přehledu výdajů s tabulkou
 */
export const VydajePrehledScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    vydajePodleDodavatelu, 
    vydaje,
    vybranyMesic,
    vybranyRok, 
    nacitaSe,
    zmenitMesic, 
    formatujCastku,
    getNazevMesice,
    formular,
    onCastkaChange,
    onDatumChange,
    onKategorieChange,
    onDodavatelChange,
    onDodavatelSelect,
    onSubmit,
    onDatePickerVisibilityChange,
    smazatPosledniVydaj
  } = useVydajePrehled();
  
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
    >
      {/* Formulář pro zadávání výdajů */}
      <FormularVydaju
        castka={formular.castka}
        datum={formular.datum}
        kategorie={formular.kategorie}
        dodavatel={formular.dodavatel}
        isDatePickerVisible={formular.isDatePickerVisible}
        isLoading={formular.isLoading}
        navrhovaniDodavateleViditelne={formular.navrhovaniDodavateleViditelne}
        navrhyDodavatelu={formular.navrhyDodavatelu}
        onCastkaChange={onCastkaChange}
        onDatumChange={onDatumChange}
        onKategorieChange={onKategorieChange}
        onDodavatelChange={onDodavatelChange}
        onDodavatelSelect={onDodavatelSelect}
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