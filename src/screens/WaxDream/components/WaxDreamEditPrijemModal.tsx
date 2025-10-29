/** WaxDreamEditPrijemModal - Modální okno pro editaci příjmu */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { WaxDreamPrijem } from '../hooks/useWaxDream';

export interface WaxDreamEditPrijemModalProps {
  visible: boolean;
  prijem: WaxDreamPrijem | null;
  onClose: () => void;
  onSave: (prijem: WaxDreamPrijem) => Promise<void>;
  onDelete: (prijem: WaxDreamPrijem) => Promise<void>;
}

export const WaxDreamEditPrijemModal: React.FC<WaxDreamEditPrijemModalProps> = ({
  visible,
  prijem,
  onClose,
  onSave,
  onDelete,
}) => {
  const [castka, setCastka] = useState('');
  const [datum, setDatum] = useState(new Date());
  const [popis, setPopis] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Naplnění formuláře při otevření modálního okna
  useEffect(() => {
    if (prijem && visible) {
      setCastka(prijem.castka.toString());
      setDatum(new Date(prijem.datum));
      setPopis(prijem.popis);
    }
  }, [prijem, visible]);

  const handleCastkaChange = (text: string) => {
    // Povolíme pouze čísla a jednu desetinnou čárku/tečku
    const cleanedText = text.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    const finalText = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanedText;
    setCastka(finalText);
  };

  const handleDatumChange = (selectedDate: Date) => {
    setIsDatePickerVisible(false);
    if (selectedDate) {
      setDatum(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!prijem || !castka || !popis) {
      Alert.alert('Chyba', 'Vyplňte všechna pole');
      return;
    }

    setIsLoading(true);
    try {
      const upravenyPrijem: WaxDreamPrijem = {
        ...prijem,
        castka: parseFloat(castka),
        datum: datum.toISOString(),
        popis: popis.trim(),
        rok: datum.getFullYear(),
      };

      await onSave(upravenyPrijem);
      onClose();
    } catch (error) {
      Alert.alert('Chyba', 'Nepodařilo se uložit příjem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!prijem) return;

    Alert.alert(
      'Smazat příjem',
      `Opravdu chcete smazat příjem "${prijem.popis}" za ${prijem.castka.toLocaleString()} Kč?`,
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(prijem);
              onClose();
            } catch (error) {
              Alert.alert('Chyba', 'Nepodařilo se smazat příjem');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Hlavička */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editovat příjem</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Obsah */}
          <View style={styles.content}>
            {/* První řádek - Datum vlevo, Částka vpravo */}
            <View style={styles.firstRow}>
              {/* Datum */}
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Datum</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setIsDatePickerVisible(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {datum.toLocaleDateString('cs-CZ')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Částka */}
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Částka</Text>
                <TextInput
                  style={styles.input}
                  value={castka}
                  onChangeText={handleCastkaChange}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Popis */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Popis</Text>
              <TextInput
                style={styles.input}
                value={popis}
                onChangeText={setPopis}
                placeholder="Popis příjmu"
                placeholderTextColor="#999"
              />
            </View>

            {/* Tlačítka */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Smazat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Uložit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* DateTimePicker */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDatumChange}
            onCancel={() => setIsDatePickerVisible(false)}
            date={datum}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 30, // Stejná šířka jako closeButton pro vycentrování
  },
  content: {
    padding: 16,
  },
  firstRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInputContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#E53935',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
