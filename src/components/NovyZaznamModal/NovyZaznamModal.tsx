/** NovyZaznamModal - Modální okno pro přidání nového záznamu */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface NovyZaznamModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  type: 'waxdream' | 'kolonial' | 'domacnost';
}

/**
 * @description Modální okno pro přidání nového záznamu se stejným stylem jako edit modály
 */
export const NovyZaznamModal: React.FC<NovyZaznamModalProps> = ({
  visible,
  onClose,
  onSubmit,
  type,
}) => {
  const [castka, setCastka] = useState('');
  const [datum, setDatum] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // WaxDream specifické stavy
  const [aktivniTab, setAktivniTab] = useState<'prijem' | 'vydaj'>('prijem');
  const [popis, setPopis] = useState('');
  const [kategorie, setKategorie] = useState<'MATERIAL' | 'PROVOZ' | undefined>(undefined);
  const [dodavatel, setDodavatel] = useState('');
  
  // Koloniál specifické stavy
  const [kategoriePrijmu, setKategoriePrijmu] = useState<'Tržba' | 'Jiné' | undefined>(undefined);
  const [popisPrijmu, setPopisPrijmu] = useState('');
  const [kategorieVydaje, setKategorieVydaje] = useState<'ZBOZI' | 'PROVOZ' | undefined>(undefined);
  const [dodavatelVydaje, setDodavatelVydaje] = useState('');
  
  // Domácnost specifické stavy
  const [kategorieDomacnost, setKategorieDomacnost] = useState<'JIDLO' | 'JINE' | 'PRAVIDELNE' | 'PRIJEM' | undefined>(undefined);
  const [ucel, setUcel] = useState('');

  // Pro typ 'domacnost' nastavit výchozí tab na Výdaj při otevření modalu
  useEffect(() => {
    if (visible && type === 'domacnost') {
      setAktivniTab('vydaj');
    }
  }, [visible, type]);

  const handleSubmit = async () => {
    if (!castka || parseFloat(castka) <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      let data: any = {
        castka: parseFloat(castka),
        datum: datum,
      };

      if (type === 'waxdream') {
        if (aktivniTab === 'prijem') {
          if (!popis) return;
          data = { ...data, popis };
        } else {
          if (!kategorie || !dodavatel) return;
          data = { ...data, kategorie, dodavatel };
        }
      } else if (type === 'kolonial') {
        if (aktivniTab === 'prijem') {
          if (!kategoriePrijmu) return;
          data = { ...data, kategorie: kategoriePrijmu, popis: popisPrijmu };
        } else {
          if (!kategorieVydaje || !dodavatelVydaje) return;
          data = { ...data, kategorie: kategorieVydaje, dodavatel: dodavatelVydaje };
        }
      } else if (type === 'domacnost') {
        if (aktivniTab === 'prijem') {
          if (!ucel) return;
          data = { ...data, kategorie: 'PRIJEM', ucel };
        } else {
          if (!kategorieDomacnost) return;
          data = { ...data, kategorie: kategorieDomacnost, ucel };
        }
      }

      await onSubmit(data);
      
      // Reset formuláře
      setCastka('');
      setPopis('');
      setDodavatel('');
      setPopisPrijmu('');
      setDodavatelVydaje('');
      setUcel('');
      setKategorie(undefined);
      setKategoriePrijmu(undefined);
      setKategorieVydaje(undefined);
      setKategorieDomacnost(undefined);
      
      onClose();
    } catch (error) {
      console.error('Chyba při ukládání:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (type === 'waxdream') {
      return (
        <>
          {aktivniTab === 'prijem' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Popis</Text>
              <TextInput
                style={styles.input}
                value={popis}
                onChangeText={setPopis}
                placeholder="Zadejte popis příjmu"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          ) : (
            <>
              <View style={styles.kategorieSection}>
                <Text style={styles.kategorieLabel}>Kategorie</Text>
                <View style={styles.kategorieContainer}>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonMaterial,
                      kategorie === 'MATERIAL' && styles.kategorieButtonMaterialActive
                    ]}
                    onPress={() => setKategorie('MATERIAL')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextMaterial,
                      kategorie === 'MATERIAL' && styles.kategorieButtonTextMaterialActive
                    ]}>
                      Materiál
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonProvoz,
                      kategorie === 'PROVOZ' && styles.kategorieButtonProvozActive
                    ]}
                    onPress={() => setKategorie('PROVOZ')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextProvoz,
                      kategorie === 'PROVOZ' && styles.kategorieButtonTextProvozActive
                    ]}>
                      Provoz
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Dodavatel</Text>
                <TextInput
                  style={styles.input}
                  value={dodavatel}
                  onChangeText={setDodavatel}
                  placeholder="Zadejte dodavatele"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </>
          )}
        </>
      );
    } else if (type === 'kolonial') {
      return (
        <>
          {aktivniTab === 'prijem' ? (
            <>
              <View style={styles.kategorieSection}>
                <Text style={styles.kategorieLabel}>Kategorie</Text>
                <View style={styles.kategorieContainer}>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonTrzba,
                      kategoriePrijmu === 'Tržba' && styles.kategorieButtonTrzbaActive
                    ]}
                    onPress={() => setKategoriePrijmu('Tržba')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextTrzba,
                      kategoriePrijmu === 'Tržba' && styles.kategorieButtonTextTrzbaActive
                    ]}>
                      Tržba
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonJine,
                      kategoriePrijmu === 'Jiné' && styles.kategorieButtonJineActive
                    ]}
                    onPress={() => setKategoriePrijmu('Jiné')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextJine,
                      kategoriePrijmu === 'Jiné' && styles.kategorieButtonTextJineActive
                    ]}>
                      Jiné
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {kategoriePrijmu === 'Jiné' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Popis</Text>
                  <TextInput
                    style={styles.input}
                    value={popisPrijmu}
                    onChangeText={setPopisPrijmu}
                    placeholder="Zadejte popis příjmu"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.kategorieSection}>
                <Text style={styles.kategorieLabel}>Kategorie</Text>
                <View style={styles.kategorieContainer}>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonZbozi,
                      kategorieVydaje === 'ZBOZI' && styles.kategorieButtonZboziActive
                    ]}
                    onPress={() => setKategorieVydaje('ZBOZI')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextZbozi,
                      kategorieVydaje === 'ZBOZI' && styles.kategorieButtonTextZboziActive
                    ]}>
                      Zboží
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonProvoz,
                      kategorieVydaje === 'PROVOZ' && styles.kategorieButtonProvozActive
                    ]}
                    onPress={() => setKategorieVydaje('PROVOZ')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextProvoz,
                      kategorieVydaje === 'PROVOZ' && styles.kategorieButtonTextProvozActive
                    ]}>
                      Provoz
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Dodavatel</Text>
                <TextInput
                  style={styles.input}
                  value={dodavatelVydaje}
                  onChangeText={setDodavatelVydaje}
                  placeholder="Zadejte dodavatele"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </>
          )}
        </>
      );
    } else if (type === 'domacnost') {
      return (
        <>
          {aktivniTab === 'prijem' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Popis</Text>
              <TextInput
                style={styles.input}
                value={ucel}
                onChangeText={setUcel}
                placeholder="Zadejte popis příjmu"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          ) : (
            <>
              <View style={styles.kategorieSection}>
                <Text style={styles.kategorieLabel}>Kategorie</Text>
                <View style={styles.kategorieContainer}>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonJidlo,
                      kategorieDomacnost === 'JIDLO' && styles.kategorieButtonJidloActive
                    ]}
                    onPress={() => setKategorieDomacnost('JIDLO')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextJidlo,
                      kategorieDomacnost === 'JIDLO' && styles.kategorieButtonTextJidloActive
                    ]}>
                      Jídlo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonJine,
                      kategorieDomacnost === 'JINE' && styles.kategorieButtonJineActive
                    ]}
                    onPress={() => setKategorieDomacnost('JINE')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextJine,
                      kategorieDomacnost === 'JINE' && styles.kategorieButtonTextJineActive
                    ]}>
                      Jiné
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.kategorieButton, 
                      styles.kategorieButtonPravidelne,
                      kategorieDomacnost === 'PRAVIDELNE' && styles.kategorieButtonPravidelneActive
                    ]}
                    onPress={() => setKategorieDomacnost('PRAVIDELNE')}
                  >
                    <Text style={[
                      styles.kategorieButtonText, 
                      styles.kategorieButtonTextPravidelne,
                      kategorieDomacnost === 'PRAVIDELNE' && styles.kategorieButtonTextPravidelneActive
                    ]}>
                      Pravidelné
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Účel</Text>
                <TextInput
                  style={styles.input}
                  value={ucel}
                  onChangeText={setUcel}
                  placeholder="Zadejte účel"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </>
          )}
        </>
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlayInner}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* Hlavička */}
                <View style={styles.header}>
                  <TouchableOpacity 
                    onPress={() => {
                      Keyboard.dismiss();
                      onClose();
                    }} 
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Nový záznam</Text>
                  <View style={styles.headerSpacer} />
                </View>

                {/* Obsah - ScrollView pro iOS */}
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* Přepínač Příjem/Výdaj - vždy nahoře */}
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[
                        styles.tabButton, 
                        aktivniTab === 'prijem' && styles.tabButtonPrijemActive
                      ]}
                      onPress={() => {
                        Keyboard.dismiss();
                        setAktivniTab('prijem');
                      }}
                    >
                      <Text style={[
                        styles.tabButtonText, 
                        aktivniTab === 'prijem' && styles.tabButtonTextPrijemActive
                      ]}>
                        Příjem
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tabButton, 
                        aktivniTab === 'vydaj' && styles.tabButtonVydajActive
                      ]}
                      onPress={() => {
                        Keyboard.dismiss();
                        setAktivniTab('vydaj');
                      }}
                    >
                      <Text style={[
                        styles.tabButtonText, 
                        aktivniTab === 'vydaj' && styles.tabButtonTextVydajActive
                      ]}>
                        Výdaj
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Datum a Částka - vždy pod přepínačem */}
                  <View style={styles.firstRow}>
                    {/* Datum */}
                    <View style={styles.halfInputContainer}>
                      <Text style={styles.label}>Datum</Text>
                      <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => {
                          Keyboard.dismiss();
                          setIsDatePickerVisible(true);
                        }}
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
                        onChangeText={setCastka}
                        placeholder="0"
                        keyboardType="numeric"
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                  </View>

                  {/* Specifický obsah podle typu */}
                  {renderContent()}

                  {/* Tlačítka */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        Keyboard.dismiss();
                        onClose();
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Zrušit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                      onPress={async () => {
                        Keyboard.dismiss();
                        await handleSubmit();
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.saveButtonText}>Uložit</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDatum(date);
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalOverlayInner: {
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
    maxHeight: '90%',
    elevation: 5,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollViewContent: {
    padding: 16,
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
    width: 26,
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
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: 'white',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  tabButtonPrijemActive: {
    backgroundColor: '#E8F5E8', // Světle zelené pozadí pro Příjem
  },
  tabButtonVydajActive: {
    backgroundColor: '#FFEBEE', // Světle červené pozadí pro Výdaj
  },
  tabButtonTextPrijemActive: {
    color: '#4CAF50', // Zelená barva pro Příjem
    fontWeight: '600',
  },
  tabButtonTextVydajActive: {
    color: '#E53935', // Červená barva pro Výdaj
    fontWeight: '600',
  },
  kategorieSection: {
    marginBottom: 12,
  },
  kategorieLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  kategorieContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kategorieButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  kategorieButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  // Specifické barvy pro kategorie podle záznamů
  kategorieButtonMaterial: {
    borderColor: '#2196F3', // Modrá pro materiál
  },
  kategorieButtonMaterialActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  kategorieButtonProvoz: {
    borderColor: '#FF9800', // Oranžová pro provoz
  },
  kategorieButtonProvozActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  kategorieButtonZbozi: {
    borderColor: '#2196F3', // Modrá pro zboží
  },
  kategorieButtonZboziActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  kategorieButtonTrzba: {
    borderColor: '#4CAF50', // Zelená pro tržbu
  },
  kategorieButtonTrzbaActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  kategorieButtonJine: {
    borderColor: '#FF9800', // Oranžová pro jiné
  },
  kategorieButtonJineActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  kategorieButtonJidlo: {
    borderColor: '#2196F3', // Modrá pro jídlo
  },
  kategorieButtonJidloActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  kategorieButtonPravidelne: {
    borderColor: '#9C27B0', // Fialová pro pravidelné
  },
  kategorieButtonPravidelneActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  kategorieButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  kategorieButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  // Specifické barvy textu pro kategorie
  kategorieButtonTextMaterial: {
    color: '#2196F3',
  },
  kategorieButtonTextMaterialActive: {
    color: 'white',
  },
  kategorieButtonTextProvoz: {
    color: '#FF9800',
  },
  kategorieButtonTextProvozActive: {
    color: 'white',
  },
  kategorieButtonTextZbozi: {
    color: '#2196F3',
  },
  kategorieButtonTextZboziActive: {
    color: 'white',
  },
  kategorieButtonTextTrzba: {
    color: '#4CAF50',
  },
  kategorieButtonTextTrzbaActive: {
    color: 'white',
  },
  kategorieButtonTextJine: {
    color: '#FF9800',
  },
  kategorieButtonTextJineActive: {
    color: 'white',
  },
  kategorieButtonTextJidlo: {
    color: '#2196F3',
  },
  kategorieButtonTextJidloActive: {
    color: 'white',
  },
  kategorieButtonTextPravidelne: {
    color: '#9C27B0',
  },
  kategorieButtonTextPravidelneActive: {
    color: 'white',
  },
  buttonContainer: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
