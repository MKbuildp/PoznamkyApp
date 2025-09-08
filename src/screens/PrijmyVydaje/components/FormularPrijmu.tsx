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
import { KategoriePrijmu } from '../../ObchodPrehledScreen/types/types';

/**
 * @description Komponenta pro formulář zadávání příjmů
 */
export const FormularPrijmu: React.FC<FormularPrijmuProps> = ({
  castka,
  datum,
  kategorie,
  popis,
  isDatePickerVisible,
  isLoading,
  onCastkaChange,
  onDatumChange,
  onKategorieChange,
  onPopisChange,
  onSubmit,
  onDatePickerVisibilityChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Nadpis formuláře */}
      <Text style={styles.nadpis}>Příjem</Text>
      
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

      {/* Tlačítka pro výběr kategorie */}
      <View style={styles.kategorieContainer}>
        <TouchableOpacity
          style={[
            styles.kategorieButton,
            styles.kategorieButtonTrzba,
            kategorie === KategoriePrijmu.TRZBA && styles.kategorieButtonTrzbaSelected
          ]}
          onPress={() => onKategorieChange(KategoriePrijmu.TRZBA)}
        >
          <Text style={[
            styles.kategorieButtonText,
            styles.kategorieButtonTrzbaText,
            kategorie === KategoriePrijmu.TRZBA && styles.kategorieButtonTextSelected
          ]}>
            Tržba
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.kategorieButton,
            styles.kategorieButtonJine,
            kategorie === KategoriePrijmu.JINE && styles.kategorieButtonJineSelected
          ]}
          onPress={() => onKategorieChange(KategoriePrijmu.JINE)}
        >
          <Text style={[
            styles.kategorieButtonText,
            styles.kategorieButtonJineText,
            kategorie === KategoriePrijmu.JINE && styles.kategorieButtonTextSelected
          ]}>
            Jiné
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pole pro popis - zobrazí se pouze když je vybrána kategorie "Jiné" */}
      {kategorie === KategoriePrijmu.JINE && (
        <View style={styles.inputContainer}>
          <Text style={styles.popisek}>Popis</Text>
          <TextInput
            style={styles.input}
            value={popis}
            onChangeText={onPopisChange}
            placeholder="Zadejte popis"
            returnKeyType="done"
            autoCapitalize="sentences"
          />
        </View>
      )}

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
  kategorieContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  kategorieButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  kategorieButtonTrzba: {
    borderColor: '#93C572',
  },
  kategorieButtonTrzbaSelected: {
    backgroundColor: '#93C572',
  },
  kategorieButtonText: {
    fontSize: 16,
  },
  kategorieButtonTrzbaText: {
    color: '#93C572',
  },
  kategorieButtonJine: {
    borderColor: '#FF9800',
  },
  kategorieButtonJineSelected: {
    backgroundColor: '#FF9800',
  },
  kategorieButtonJineText: {
    color: '#FF9800',
  },
  kategorieButtonTextSelected: {
    color: 'white',
  },
}); 