/** VydajeScreen - Obrazovka pro správu výdajů */
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { FormularVydaju } from './components/FormularVydaju';
import { useVydaje } from './hooks/useVydaje';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Vydaje'>;

/**
 * @description Hlavní obrazovka pro zadávání a přehled výdajů
 */
export const VydajeScreen: React.FC<Props> = ({ navigation }) => {
  const { state, handlers, utils } = useVydaje();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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