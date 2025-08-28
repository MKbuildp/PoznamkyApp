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
import { FormularDomacnostiProps, KategorieDomacnostVydaju } from '../types/types';

/**
 * @description Komponenta pro formulář zadávání domácích výdajů
 */
export const FormularDomacnosti: React.FC<FormularDomacnostiProps> = ({
  castka,
  datum,
  kategorie,
  isDatePickerVisible,
  isLoading,
  onCastkaChange,
  onDatumChange,
  onKategorieChange,
  onSubmit,
  onDatePickerVisibilityChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Nadpis formuláře */}
      <Text style={styles.nadpis}>Domácí výdaj</Text>
      
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

      {/* Kategorie tlačítka */}
      <View style={styles.kategorieContainer}>
        <TouchableOpacity
          style={[
            styles.kategorieButton,
            styles.kategorieButtonJidlo,
            kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieButtonJidloSelected
          ]}
          onPress={() => onKategorieChange(KategorieDomacnostVydaju.JIDLO)}
        >
          <Text style={[
            styles.kategorieButtonText,
            styles.kategorieButtonJidloText,
            kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieButtonTextSelected
          ]}>
            Jídlo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.kategorieButton,
            styles.kategorieButtonJine,
            kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieButtonJineSelected
          ]}
          onPress={() => onKategorieChange(KategorieDomacnostVydaju.JINE)}
        >
          <Text style={[
            styles.kategorieButtonText,
            styles.kategorieButtonJineText,
            kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieButtonTextSelected
          ]}>
            Jiné
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
    borderColor: '#9C27B0', // Fialová barva pro domácnost
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
    borderColor: '#000',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  datumButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    padding: 12,
  },
  datumButtonText: {
    fontSize: 16,
    color: '#333',
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
  kategorieButtonJidlo: {
    borderColor: '#4CAF50', // Zelená pro jídlo
  },
  kategorieButtonJine: {
    borderColor: '#FF9800', // Oranžová pro jiné
  },
  kategorieButtonJidloSelected: {
    backgroundColor: '#4CAF50',
  },
  kategorieButtonJineSelected: {
    backgroundColor: '#FF9800',
  },
  kategorieButtonText: {
    fontSize: 16,
  },
  kategorieButtonJidloText: {
    color: '#4CAF50',
  },
  kategorieButtonJineText: {
    color: '#FF9800',
  },
  kategorieButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#9C27B0', // Fialová pro domácnost
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

