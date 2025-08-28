/** PrijmyScreen - Obrazovka pro správu příjmů */
import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { FormularPrijmu } from './components/FormularPrijmu';
import { usePrijmy } from './hooks/usePrijmy';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Prijmy'>;

/**
 * @description Hlavní obrazovka pro zadávání příjmů
 */
export const PrijmyScreen: React.FC<Props> = ({ navigation }) => {
  const { state, handlers, utils } = usePrijmy();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 8,
  }
}); 