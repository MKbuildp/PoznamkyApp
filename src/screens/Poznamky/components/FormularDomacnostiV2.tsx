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
import { KategorieDomacnostVydaju } from '../types/types';

// Props interface
export interface FormularDomacnostiV2Props {
  // Společné props
  castka: string;
  datum: Date;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  
  // Handlers
  onCastkaChange: (castka: string) => void;
  onDatumChange: (datum: Date) => void;
  onDatePickerVisibilityChange: (visible: boolean) => void;
  onSubmit: () => void;
  
  // Kategorie a účel
  kategorie?: KategorieDomacnostVydaju | undefined;
  ucel?: string;
  onKategorieChange?: (kategorie: KategorieDomacnostVydaju) => void;
  onUcelChange?: (ucel: string) => void;
}

/**
 * @description Nová komponenta pro formulář domácích výdajů s podobným designem jako FormularPrijemVydaj
 */
export const FormularDomacnostiV2: React.FC<FormularDomacnostiV2Props> = ({
  castka,
  datum,
  isDatePickerVisible,
  isLoading,
  onCastkaChange,
  onDatumChange,
  onDatePickerVisibilityChange,
  onSubmit,
  kategorie,
  ucel = '',
  onKategorieChange,
  onUcelChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Datum a Částka na jednom řádku */}
      <View style={styles.datumCastkaContainer}>
        {/* Pole pro datum */}
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

        {/* Pole pro částku */}
        <View style={styles.castkaContainer}>
          <Text style={styles.popisek}>Částka</Text>
          <TextInput
            style={styles.input}
            value={castka}
            onChangeText={onCastkaChange}
            placeholder=""
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Kategorie tlačítka - pod Datum a Částkou */}
      <View style={styles.kategorieContainer}>
        {/* První řádek - Jídlo a Jiné */}
        <View style={styles.kategorieRadek}>
          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonDefault,
              kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieButtonSelected
            ]}
            onPress={() => castka ? onKategorieChange?.(KategorieDomacnostVydaju.JIDLO) : null}
            disabled={!castka}
          >
            <View style={styles.kategorieButtonContent}>
              <View style={[
                styles.kategorieIndicator,
                kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieIndicatorSelected
              ]} />
              <Text style={[
                styles.kategorieButtonText,
                styles.kategorieButtonTextDefault,
                kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieButtonTextSelected
              ]}>
                Jídlo
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonDefault,
              kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieButtonSelected
            ]}
            onPress={() => castka ? onKategorieChange?.(KategorieDomacnostVydaju.JINE) : null}
            disabled={!castka}
          >
            <View style={styles.kategorieButtonContent}>
              <View style={[
                styles.kategorieIndicator,
                kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieIndicatorSelected
              ]} />
              <Text style={[
                styles.kategorieButtonText,
                styles.kategorieButtonTextDefault,
                kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieButtonTextSelected
              ]}>
                Jiné
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Druhý řádek - Pravidelné a Příjem */}
        <View style={styles.kategorieRadek}>
          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonDefault,
              kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieButtonSelected
            ]}
            onPress={() => castka ? onKategorieChange?.(KategorieDomacnostVydaju.PRAVIDELNE) : null}
            disabled={!castka}
          >
            <View style={styles.kategorieButtonContent}>
              <View style={[
                styles.kategorieIndicator,
                kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieIndicatorSelected
              ]} />
              <Text style={[
                styles.kategorieButtonText,
                styles.kategorieButtonTextDefault,
                kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieButtonTextSelected
              ]}>
                Pravidelné
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonDefault,
              kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieButtonSelected
            ]}
            onPress={() => castka ? onKategorieChange?.(KategorieDomacnostVydaju.PRIJEM) : null}
            disabled={!castka}
          >
            <View style={styles.kategorieButtonContent}>
              <View style={[
                styles.kategorieIndicator,
                kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieIndicatorSelected
              ]} />
              <Text style={[
                styles.kategorieButtonText,
                styles.kategorieButtonTextDefault,
                kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieButtonTextSelected
              ]}>
                Příjem
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pole pro účel - zobrazí se pro všechny kategorie kromě Příjem */}
      {kategorie && kategorie !== KategorieDomacnostVydaju.PRIJEM && (
        <View style={styles.inputContainer}>
          <Text style={styles.popisek}>Účel {
            kategorie === KategorieDomacnostVydaju.JIDLO ? '(nepovinné)' :
            (kategorie === KategorieDomacnostVydaju.JINE || kategorie === KategorieDomacnostVydaju.PRAVIDELNE) ? '(povinné)' :
            ''
          }</Text>
          <TextInput
            style={[
              styles.input,
              kategorie !== KategorieDomacnostVydaju.JIDLO && kategorie !== KategorieDomacnostVydaju.JINE && kategorie !== KategorieDomacnostVydaju.PRAVIDELNE && styles.inputDisabled
            ]}
            value={ucel}
            onChangeText={onUcelChange}
            placeholder=""
            returnKeyType="done"
            autoCapitalize="sentences"
            editable={kategorie === KategorieDomacnostVydaju.JIDLO || kategorie === KategorieDomacnostVydaju.JINE || kategorie === KategorieDomacnostVydaju.PRAVIDELNE}
          />
        </View>
      )}

      {/* DatePicker modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={onDatumChange}
        onCancel={() => onDatePickerVisibilityChange(false)}
        locale="cs_CZ"
      />

      {/* Submit tlačítko */}
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
    borderRadius: 0, // Odstraněn border radius
    margin: 0, // Odstraněn margin
    elevation: 0, // Odstraněn elevation
    borderWidth: 0, // Odstraněn border
    borderColor: 'transparent',
    overflow: 'visible', // Změněno z hidden
  },
  
  // Společné styly
  
  // Datum a Částka na jednom řádku
  datumCastkaContainer: {
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
  inputContainer: {
    marginBottom: 12,
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
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#9E9E9E',
    borderColor: '#E0E0E0',
  },
  
  // Datum styly
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
  
  // Kategorie styly
  kategorieContainer: {
    marginBottom: 12,
    gap: 8,
  },
  kategorieRadek: {
    flexDirection: 'row',
    gap: 8,
  },
  kategorieButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  kategorieButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kategorieIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  kategorieIndicatorSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  // Nové styly pro jednotné tlačítka
  kategorieButtonDefault: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  kategorieButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#C8E6C9',
  },
  kategorieButtonText: {
    fontSize: 16,
  },
  kategorieButtonTextDefault: {
    color: '#9E9E9E',
  },
  kategorieButtonTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  
  // Submit tlačítko styly
  submitButton: {
    backgroundColor: '#2196F3', // Modrá jako FormularPrijemVydaj
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
