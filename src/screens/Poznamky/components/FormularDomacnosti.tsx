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
  ucel,
  isDatePickerVisible,
  isLoading,
  onCastkaChange,
  onDatumChange,
  onKategorieChange,
  onUcelChange,
  onSubmit,
  onDatePickerVisibilityChange,
  onSmazatPosledni,
}) => {
  return (
    <View style={styles.container}>
      
      {/* Pole pro datum a částku na jednom řádku */}
      <View style={styles.datumCastkaRadek}>
        {/* Datum vlevo */}
        <View style={styles.datumContainer}>
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

        {/* Částka vpravo */}
        <View style={styles.castkaContainer}>
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
      </View>

      {/* Kategorie tlačítka */}
      <View style={styles.kategorieContainer}>
        {/* První řádek - Jídlo, Jiné, Pravidelné */}
        <View style={styles.kategorieRadek}>
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

          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonPravidelne,
              kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieButtonPravidelneSelected
            ]}
            onPress={() => onKategorieChange(KategorieDomacnostVydaju.PRAVIDELNE)}
          >
            <Text style={[
              styles.kategorieButtonText,
              styles.kategorieButtonPravidelneText,
              kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieButtonTextSelected
            ]}>
              Pravidelné
            </Text>
          </TouchableOpacity>
        </View>

        {/* Druhý řádek - Příjem */}
        <View style={styles.kategorieRadek}>
          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonPrijem,
              kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieButtonPrijemSelected
            ]}
            onPress={() => onKategorieChange(KategorieDomacnostVydaju.PRIJEM)}
          >
            <Text style={[
              styles.kategorieButtonText,
              styles.kategorieButtonPrijemText,
              kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieButtonTextSelected
            ]}>
              Příjem
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pole pro účel - zobrazí se pro všechny kategorie kromě Příjem */}
      {kategorie !== KategorieDomacnostVydaju.PRIJEM && (
        <View style={styles.inputContainer}>
          <Text style={styles.popisek}>Účel {
            kategorie === KategorieDomacnostVydaju.JIDLO ? '(nepovinné)' :
            (kategorie === KategorieDomacnostVydaju.JINE || kategorie === KategorieDomacnostVydaju.PRAVIDELNE) ? '(povinné)' :
            ''
          }</Text>
          <TextInput
            style={styles.input}
            value={ucel}
            onChangeText={onUcelChange}
            placeholder={kategorie === KategorieDomacnostVydaju.JIDLO ? "Např. oběd, večeře, svačina..." : "Zadejte účel výdaje"}
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

      {/* Tlačítka Smazat a Uložit */}
      <View style={styles.tlacitkaContainer}>
        <TouchableOpacity
          style={styles.smazatTlacitko}
          onPress={onSmazatPosledni}
        >
          <Text style={styles.smazatTlacitkoText}>🗑️ Smazat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>💾 Uložit</Text>
          )}
        </TouchableOpacity>
      </View>
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

  inputContainer: {
    marginBottom: 12,
  },
  datumCastkaRadek: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  datumContainer: {
    flex: 1,
  },
  castkaContainer: {
    flex: 1,
  },
  popisek: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
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
    marginBottom: 12,
    gap: 8,
  },
  kategorieRadek: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  kategorieButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  kategorieButtonJidlo: {
    borderColor: '#2196F3', // Modrá pro jídlo
  },
  kategorieButtonJine: {
    borderColor: '#FF9800', // Oranžová pro jiné
  },
  kategorieButtonPravidelne: {
    borderColor: '#9C27B0', // Fialová pro pravidelné
  },
  kategorieButtonJidloSelected: {
    backgroundColor: '#2196F3',
  },
  kategorieButtonJineSelected: {
    backgroundColor: '#FF9800',
  },
  kategorieButtonPravidelneSelected: {
    backgroundColor: '#9C27B0',
  },
  kategorieButtonText: {
    fontSize: 16,
  },
  kategorieButtonJidloText: {
    color: '#2196F3',
  },
  kategorieButtonJineText: {
    color: '#FF9800',
  },
  kategorieButtonPravidelneText: {
    color: '#9C27B0',
  },
  kategorieButtonPrijem: {
    borderColor: '#4CAF50', // Zelená pro příjem
  },
  kategorieButtonPrijemSelected: {
    backgroundColor: '#4CAF50',
  },
  kategorieButtonPrijemText: {
    color: '#4CAF50',
  },
  kategorieButtonTextSelected: {
    color: 'white',
  },
  tlacitkaContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  submitButton: {
    flex: 1,
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
  smazatTlacitko: {
    flex: 1,
    backgroundColor: '#FF5252',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  smazatTlacitkoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

