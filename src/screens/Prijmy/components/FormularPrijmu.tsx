import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FormularPrijmuProps } from '../types/types';

/**
 * @description Komponenta pro formulář zadávání příjmů
 */
export const FormularPrijmu: React.FC<FormularPrijmuProps> = ({
    castka,
  datum,
  isDatePickerVisible,
  isLoading,
  onCastkaChange,
  onDatumChange,
  onSubmit,
  onDatePickerVisibilityChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Nadpis formuláře */}
      <Text style={styles.nadpis}>Přidat tržbu</Text>
      
      {/* Pole pro částku s popiskem */}
      <View style={styles.inputContainer}>
        <Text style={styles.popisek}>Částka</Text>
      <TextInput
        style={styles.input}
        value={castka}
        onChangeText={onCastkaChange}
        placeholder="Zadejte částku"
        keyboardType="decimal-pad"
        returnKeyType="done"
      />
      </View>

      {/* Pole pro datum s popiskem */}
      <View style={styles.inputContainer}>
        <Text style={styles.popisek}>Datum</Text>
      <TouchableOpacity
        style={styles.datumButton}
        onPress={() => onDatePickerVisibilityChange(true)}
      >
        <Text style={styles.datumButtonText}>
          {datum.toLocaleDateString('cs-CZ')}
        </Text>
      </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={onDatumChange}
        onCancel={() => onDatePickerVisibilityChange(false)}
        locale="cs_CZ"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Uložit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#43A047',
  },
  nadpis: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 12,
  },
  popisek: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  datumButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    padding: 12,
  },
  datumButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 