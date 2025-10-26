/** EditVydajModal - Modální okno pro editaci výdajů */
import React, { useState, useEffect } from 'react';
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
import { DomacnostVydaj, KategorieDomacnostVydaju } from '../types/types';

interface EditVydajModalProps {
  visible: boolean;
  vydaj: DomacnostVydaj | null;
  onClose: () => void;
  onSave: (editedVydaj: DomacnostVydaj) => Promise<void>;
  onDelete?: (vydaj: DomacnostVydaj) => Promise<void>;
}

/**
 * @description Modální okno pro editaci výdajů s formulářem
 */
export const EditVydajModal: React.FC<EditVydajModalProps> = ({
  visible,
  vydaj,
  onClose,
  onSave,
  onDelete,
}) => {
  const [castka, setCastka] = useState('');
  const [datum, setDatum] = useState(new Date());
  const [kategorie, setKategorie] = useState<KategorieDomacnostVydaju>(KategorieDomacnostVydaju.JIDLO);
  const [ucel, setUcel] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Naplnění formuláře při otevření modálního okna
  useEffect(() => {
    if (vydaj && visible) {
      setCastka(vydaj.castka.toString());
      setDatum(new Date(vydaj.datum));
      setKategorie(vydaj.kategorie);
      setUcel(vydaj.ucel || '');
    }
  }, [vydaj, visible]);

  const handleCastkaChange = (text: string) => {
    // Povolíme pouze čísla a jednu desetinnou čárku/tečku
    const cleanedText = text.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    const finalText = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanedText;
    setCastka(finalText);
  };

  const handleDatumChange = (event: any, selectedDate?: Date) => {
    setIsDatePickerVisible(false);
    if (selectedDate) {
      setDatum(selectedDate);
    }
  };

  const handleKategorieChange = (novaKategorie: KategorieDomacnostVydaju) => {
    setKategorie(novaKategorie);
  };

  const handleSave = async () => {
    if (!vydaj) return;

    // Validace
    if (!castka || parseFloat(castka) <= 0) {
      Alert.alert('Chyba', 'Zadejte platnou částku');
      return;
    }

    setIsLoading(true);

    try {
      const editedVydaj: DomacnostVydaj = {
        ...vydaj,
        castka: parseFloat(castka),
        datum: datum.toISOString(),
        kategorie,
        ucel: ucel.trim() || undefined,
      };

      await onSave(editedVydaj);
      onClose();
    } catch (error) {
      console.error('Chyba při ukládání editovaného výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit změny');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!vydaj || !onDelete) return;

    Alert.alert(
      'Smazat záznam',
      `Opravdu chcete smazat záznam "${vydaj.kategorie}" za ${vydaj.castka.toLocaleString()} Kč?`,
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(vydaj);
              onClose();
            } catch (error) {
              Alert.alert('Chyba', 'Nepodařilo se smazat záznam');
            }
          },
        },
      ]
    );
  };



  if (!vydaj) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Hlavička */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editovat záznam</Text>
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

            {/* Kategorie */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kategorie</Text>
              <View style={styles.kategorieContainer}>
                {/* První řádek - Jídlo a Pravidelné vedle sebe */}
                <View style={styles.kategorieRow}>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton,
                      kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieButtonSelected
                    ]}
                    onPress={() => handleKategorieChange(KategorieDomacnostVydaju.JIDLO)}
                  >
                    <View style={styles.kategorieButtonContent}>
                      <View style={[
                        styles.kategorieIndicator,
                        kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieIndicatorSelected
                      ]} />
                      <Text style={[
                        styles.kategorieButtonText,
                        kategorie === KategorieDomacnostVydaju.JIDLO && styles.kategorieButtonTextSelected
                      ]}>
                        Jídlo
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.kategorieButton,
                      kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieButtonSelected
                    ]}
                    onPress={() => handleKategorieChange(KategorieDomacnostVydaju.PRAVIDELNE)}
                  >
                    <View style={styles.kategorieButtonContent}>
                      <View style={[
                        styles.kategorieIndicator,
                        kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieIndicatorSelected
                      ]} />
                      <Text style={[
                        styles.kategorieButtonText,
                        kategorie === KategorieDomacnostVydaju.PRAVIDELNE && styles.kategorieButtonTextSelected
                      ]}>
                        Pravidelné
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Druhý řádek - Jiné a Příjem vedle sebe */}
                <View style={styles.kategorieRow}>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton,
                      kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieButtonSelected
                    ]}
                    onPress={() => handleKategorieChange(KategorieDomacnostVydaju.JINE)}
                  >
                    <View style={styles.kategorieButtonContent}>
                      <View style={[
                        styles.kategorieIndicator,
                        kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieIndicatorSelected
                      ]} />
                      <Text style={[
                        styles.kategorieButtonText,
                        kategorie === KategorieDomacnostVydaju.JINE && styles.kategorieButtonTextSelected
                      ]}>
                        Jiné
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.kategorieButton,
                      kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieButtonSelected
                    ]}
                    onPress={() => handleKategorieChange(KategorieDomacnostVydaju.PRIJEM)}
                  >
                    <View style={styles.kategorieButtonContent}>
                      <View style={[
                        styles.kategorieIndicator,
                        kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieIndicatorSelected
                      ]} />
                      <Text style={[
                        styles.kategorieButtonText,
                        kategorie === KategorieDomacnostVydaju.PRIJEM && styles.kategorieButtonTextSelected
                      ]}>
                        Příjem
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Účel - zobrazit pouze pokud není Příjem */}
            {kategorie !== KategorieDomacnostVydaju.PRIJEM && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Účel</Text>
                <TextInput
                  style={styles.input}
                  value={ucel}
                  onChangeText={setUcel}
                  placeholder={`Účel pro ${kategorie.toLowerCase()}`}
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* Popis pro příjmy */}
            {kategorie === KategorieDomacnostVydaju.PRIJEM && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Popis</Text>
                <TextInput
                  style={styles.input}
                  value={ucel}
                  onChangeText={setUcel}
                  placeholder="Popis příjmu (volitelné)"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* Tlačítka */}
            <View style={styles.buttonContainer}>
              {onDelete && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <Text style={styles.deleteButtonText}>Smazat</Text>
                </TouchableOpacity>
              )}
              
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
  kategorieContainer: {
    gap: 8,
  },
  kategorieRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kategorieButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
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
  kategorieButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#C8E6C9',
  },
  kategorieButtonText: {
    fontSize: 16,
  },
  kategorieButtonTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
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



