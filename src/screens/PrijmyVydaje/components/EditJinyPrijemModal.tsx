/** EditJinyPrijemModal - Modální okno pro editaci jiných příjmů */
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Prijem, KategoriePrijmu } from '../../ObchodPrehledScreen/types/types';

export interface EditJinyPrijemModalProps {
  visible: boolean;
  prijem: Prijem | null;
  onClose: () => void;
  onSave: (editedPrijem: Prijem) => Promise<void>;
  onDelete?: (prijem: Prijem) => Promise<void>;
}

/**
 * @description Modální okno pro editaci jiných příjmů
 */
export const EditJinyPrijemModal: React.FC<EditJinyPrijemModalProps> = ({
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
  const prevVisibleRef = useRef(false);

  // Naplnění formuláře při otevření modálního okna
  useEffect(() => {
    // Resetuj formulář pouze když se modální okno právě otevřelo (visible změnil z false na true)
    if (prijem && visible && !prevVisibleRef.current) {
      setCastka(prijem.castka.toString());
      setPopis(prijem.popis || '');
      // Zajištění správného parsování data
      const datumValue = prijem.datum ? new Date(prijem.datum) : new Date();
      if (!isNaN(datumValue.getTime())) {
        setDatum(datumValue);
      } else {
        setDatum(new Date());
      }
    }
    prevVisibleRef.current = visible;
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
    if (!prijem) return;

    // Validace
    if (!castka || parseFloat(castka) <= 0) {
      Alert.alert('Chyba', 'Zadejte platnou částku');
      return;
    }

    if (!popis.trim()) {
      Alert.alert('Chyba', 'Zadejte popis');
      return;
    }

    setIsLoading(true);

    try {
      const editedPrijem: Prijem = {
        ...prijem,
        castka: parseFloat(castka),
        datum: datum.toISOString(),
        kategorie: KategoriePrijmu.JINE, // Jiné příjmy jsou vždy kategorie Jiné
        popis: popis.trim(),
      };

      await onSave(editedPrijem);
      onClose();
    } catch (error) {
      console.error('Chyba při ukládání editovaného příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit změny');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!prijem || !onDelete) return;

    Alert.alert(
      'Smazat příjem',
      `Opravdu chcete smazat příjem "${prijem.popis || 'bez popisu'}" za ${prijem.castka.toLocaleString()} Kč?`,
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

  if (!prijem) return null;

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
            {onDelete && (
              <TouchableOpacity onPress={handleDelete} style={styles.deleteHeaderButton}>
                <Text style={styles.deleteHeaderButtonText}>🗑️</Text>
              </TouchableOpacity>
            )}
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
                placeholder="Zadejte popis"
                placeholderTextColor="#999"
                multiline={false}
              />
            </View>

            {/* Tlačítka */}
            <View style={styles.buttonContainer}>
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
    flex: 1,
    textAlign: 'center',
  },
  deleteHeaderButton: {
    padding: 4,
  },
  deleteHeaderButtonText: {
    fontSize: 18,
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


