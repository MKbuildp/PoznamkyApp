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
import { FormularVydajuProps, KategorieVydaju } from '../types/types';

/**
 * @description Komponenta pro formulář zadávání výdajů
 */
export const FormularVydaju: React.FC<FormularVydajuProps> = ({
  castka,
  datum,
  kategorie,
  dodavatel,
  isDatePickerVisible,
  isLoading,
  onCastkaChange,
  onDatumChange,
  onKategorieChange,
  onDodavatelChange,
  onSubmit,
  onDatePickerVisibilityChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Nadpis formuláře */}
      <Text style={styles.nadpis}>Výdaj</Text>
      
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

      {/* Pole pro dodavatele s popiskem */}
      <View style={styles.inputContainer}>
        <Text style={styles.popisek}>Dodavatel</Text>
        <TextInput
          style={styles.input}
          value={dodavatel}
          onChangeText={onDodavatelChange}
          placeholder="Zadejte dodavatele"
          returnKeyType="done"
          autoCapitalize="words"
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

      <View style={styles.kategorieContainer}>
        <TouchableOpacity
          style={[
            styles.kategorieButton,
            styles.kategorieButtonZbozi,
            kategorie === KategorieVydaju.ZBOZI && styles.kategorieButtonZboziSelected
          ]}
          onPress={() => onKategorieChange(KategorieVydaju.ZBOZI)}
        >
          <Text style={[
            styles.kategorieButtonText,
            styles.kategorieButtonZboziText,
            kategorie === KategorieVydaju.ZBOZI && styles.kategorieButtonTextSelected
          ]}>
            Zboží
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.kategorieButton,
            styles.kategorieButtonProvoz,
            kategorie === KategorieVydaju.PROVOZ && styles.kategorieButtonProvozSelected
          ]}
          onPress={() => onKategorieChange(KategorieVydaju.PROVOZ)}
        >
          <Text style={[
            styles.kategorieButtonText,
            styles.kategorieButtonProvozText,
            kategorie === KategorieVydaju.PROVOZ && styles.kategorieButtonTextSelected
          ]}>
            Provoz
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
    borderColor: '#E53935',
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
    color: '#000000',
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
  kategorieButtonZbozi: {
    borderColor: '#93C572',
  },
  kategorieButtonProvoz: {
    borderColor: '#FF9800',
  },
  kategorieButtonZboziSelected: {
    backgroundColor: '#93C572',
  },
  kategorieButtonProvozSelected: {
    backgroundColor: '#FF9800',
  },
  kategorieButtonText: {
    fontSize: 16,
  },
  kategorieButtonZboziText: {
    color: '#93C572',
  },
  kategorieButtonProvozText: {
    color: '#FF9800',
  },
  kategorieButtonTextSelected: {
    color: 'white',
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

