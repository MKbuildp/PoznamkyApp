import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KategoriePrijmu } from '../../screens/ObchodPrehledScreen/types/types';
import { KategorieVydaju } from '../../screens/Vydaje/types/types';

// Props interface
export interface FormularPrijemVydajProps {
  // Společné props
  castka: string;
  datum: Date;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  
  // Tab přepínač
  aktivniTab: 'prijem' | 'vydaj';
  onTabChange: (tab: 'prijem' | 'vydaj') => void;
  
  // Handlers
  onCastkaChange: (castka: string) => void;
  onDatumChange: (datum: Date) => void;
  onDatePickerVisibilityChange: (visible: boolean) => void;
  onSubmit: () => void;
  
  // Výdaj specifické props
  dodavatel?: string;
  kategorie?: KategorieVydaju;
  navrhovaniDodavateleViditelne?: boolean;
  navrhyDodavatelu?: string[];
  onDodavatelChange?: (dodavatel: string) => void;
  onDodavatelSelect?: (dodavatel: string) => void;
  onKategorieChange?: (kategorie: KategorieVydaju) => void;
  
  // Příjem specifické props
  kategoriePrijmu?: KategoriePrijmu;
  popis?: string;
  onKategoriePrijmuChange?: (kategorie: KategoriePrijmu) => void;
  onPopisChange?: (popis: string) => void;
  
  // Rozklikávací funkcionalita
  isCollapsible?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

/**
 * @description Sloučená komponenta pro formulář příjmů a výdajů s tab přepínačem
 */
export const FormularPrijemVydaj: React.FC<FormularPrijemVydajProps> = ({
  castka,
  datum,
  isDatePickerVisible,
  isLoading,
  aktivniTab,
  onTabChange,
  onCastkaChange,
  onDatumChange,
  onDatePickerVisibilityChange,
  onSubmit,
  dodavatel = '',
  kategorie,
  navrhovaniDodavateleViditelne = false,
  navrhyDodavatelu = [],
  onDodavatelChange,
  onDodavatelSelect,
  onKategorieChange,
  kategoriePrijmu,
  popis = '',
  onKategoriePrijmuChange,
  onPopisChange,
  isCollapsible = false,
  isVisible = true,
  onToggleVisibility,
}) => {
  return (
    <View style={styles.container}>
      {/* Rozklikávací hlavička */}
      {isCollapsible && (
        <TouchableOpacity 
          style={styles.rozklikavaciHeader}
          onPress={onToggleVisibility}
        >
          <Text style={styles.rozklikavaciHeaderText}>
            Nový záznam {isVisible ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Obsah - zobrazí se pouze pokud není rozklikávací nebo je viditelný */}
      {(!isCollapsible || isVisible) && (
        <View style={styles.contentContainer}>
          {/* Tab přepínač */}
          <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            aktivniTab === 'prijem' && styles.tabAktivni,
            aktivniTab === 'prijem' && styles.tabPrijemAktivni
          ]}
          onPress={() => onTabChange('prijem')}
        >
          <Text style={[
            styles.tabText, 
            aktivniTab === 'prijem' && styles.tabTextAktivni
          ]}>
            Příjem
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            aktivniTab === 'vydaj' && styles.tabAktivni,
            aktivniTab === 'vydaj' && styles.tabVydajAktivni
          ]}
          onPress={() => onTabChange('vydaj')}
        >
          <Text style={[
            styles.tabText, 
            aktivniTab === 'vydaj' && styles.tabTextAktivni
          ]}>
            Výdaj
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nadpis formuláře */}
      <Text style={styles.nadpis}>
        {aktivniTab === 'prijem' ? 'Přidat příjem' : 'Přidat výdaj'}
      </Text>
      
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

      {/* Kategorie výdajů tlačítka - pod Datum a Částkou */}
      {aktivniTab === 'vydaj' && (
        <View style={styles.kategorieContainer}>
          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonDefault,
              kategorie === KategorieVydaju.ZBOZI && styles.kategorieButtonSelected
            ]}
            onPress={() => castka ? onKategorieChange?.(KategorieVydaju.ZBOZI) : null}
            disabled={!castka}
          >
            <View style={styles.kategorieButtonContent}>
              <View style={[
                styles.kategorieIndicator,
                kategorie === KategorieVydaju.ZBOZI && styles.kategorieIndicatorSelected
              ]} />
              <Text style={[
                styles.kategorieButtonText,
                styles.kategorieButtonTextDefault,
                kategorie === KategorieVydaju.ZBOZI && styles.kategorieButtonTextSelected
              ]}>
                Zboží
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.kategorieButton,
              styles.kategorieButtonDefault,
              kategorie === KategorieVydaju.PROVOZ && styles.kategorieButtonSelected
            ]}
            onPress={() => castka ? onKategorieChange?.(KategorieVydaju.PROVOZ) : null}
            disabled={!castka}
          >
            <View style={styles.kategorieButtonContent}>
              <View style={[
                styles.kategorieIndicator,
                kategorie === KategorieVydaju.PROVOZ && styles.kategorieIndicatorSelected
              ]} />
              <Text style={[
                styles.kategorieButtonText,
                styles.kategorieButtonTextDefault,
                kategorie === KategorieVydaju.PROVOZ && styles.kategorieButtonTextSelected
              ]}>
                Provoz
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Příjem specifická pole */}
      {aktivniTab === 'prijem' && (
        <>
          {/* Kategorie příjmu tlačítka */}
          <View style={styles.kategorieContainer}>
            <TouchableOpacity
              style={[
                styles.kategorieButton,
                styles.kategorieButtonDefault,
                kategoriePrijmu === KategoriePrijmu.TRZBA && styles.kategorieButtonSelected
              ]}
              onPress={() => castka ? onKategoriePrijmuChange?.(KategoriePrijmu.TRZBA) : null}
              disabled={!castka}
            >
              <View style={styles.kategorieButtonContent}>
                <View style={[
                  styles.kategorieIndicator,
                  kategoriePrijmu === KategoriePrijmu.TRZBA && styles.kategorieIndicatorSelected
                ]} />
                <Text style={[
                  styles.kategorieButtonText,
                  styles.kategorieButtonTextDefault,
                  kategoriePrijmu === KategoriePrijmu.TRZBA && styles.kategorieButtonTextSelected
                ]}>
                  Tržba
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.kategorieButton,
                styles.kategorieButtonDefault,
                kategoriePrijmu === KategoriePrijmu.JINE && styles.kategorieButtonSelected
              ]}
              onPress={() => castka ? onKategoriePrijmuChange?.(KategoriePrijmu.JINE) : null}
              disabled={!castka}
            >
              <View style={styles.kategorieButtonContent}>
                <View style={[
                  styles.kategorieIndicator,
                  kategoriePrijmu === KategoriePrijmu.JINE && styles.kategorieIndicatorSelected
                ]} />
                <Text style={[
                  styles.kategorieButtonText,
                  styles.kategorieButtonTextDefault,
                  kategoriePrijmu === KategoriePrijmu.JINE && styles.kategorieButtonTextSelected
                ]}>
                  Jiné
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pole pro popis - zobrazeno trvale, aktivní pouze při výběru "Jiné" */}
          <View style={styles.inputContainer}>
            <Text style={styles.popisek}>Popis</Text>
            <TextInput
              style={[
                styles.input,
                kategoriePrijmu !== KategoriePrijmu.JINE && styles.inputDisabled
              ]}
              value={popis}
              onChangeText={onPopisChange}
              placeholder=""
              returnKeyType="done"
              multiline
              numberOfLines={2}
              editable={kategoriePrijmu === KategoriePrijmu.JINE}
            />
          </View>
        </>
      )}

      {/* Výdaj specifická pole */}
      {aktivniTab === 'vydaj' && (
        <>
          {/* Pole pro dodavatele s automatickým doplňováním */}
          <View style={styles.inputContainer}>
            <Text style={styles.popisek}>Dodavatel</Text>
            <View style={styles.dodavatelContainer}>
              <TextInput
                style={styles.input}
                value={dodavatel}
                onChangeText={onDodavatelChange}
                placeholder=""
                returnKeyType="done"
                autoCapitalize="words"
              />
              
              {navrhovaniDodavateleViditelne && (
                <View style={styles.navrhyContainer}>
                  <FlatList
                    data={navrhyDodavatelu}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.navrhItem}
                        onPress={() => onDodavatelSelect?.(item)}
                      >
                        <Text style={styles.navrhText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
          </View>

        </>
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
        style={[
          styles.submitButton,
          aktivniTab === 'prijem' && styles.submitButtonPrijem,
          aktivniTab === 'vydaj' && styles.submitButtonVydaj
        ]}
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  
  // Kontejner pro obsah
  contentContainer: {
    padding: 16,
  },
  
  // Tab přepínač styly
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabAktivni: {
    backgroundColor: 'white',
    elevation: 1,
  },
  tabPrijemAktivni: {
    backgroundColor: '#E8F5E8',
  },
  tabVydajAktivni: {
    backgroundColor: '#FFEBEE',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextAktivni: {
    color: '#333',
  },
  
  // Společné styly
  nadpis: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
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
  
  // Dodavatel styly
  dodavatelContainer: {
    position: 'relative',
    zIndex: 1,
  },
  navrhyContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    maxHeight: 150,
    zIndex: 2,
    elevation: 3,
  },
  navrhItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navrhText: {
    fontSize: 16,
    color: '#333',
  },
  
  // Kategorie styly
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
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonPrijem: {
    backgroundColor: '#2196F3',
  },
  submitButtonVydaj: {
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Styly pro rozklikávací hlavičku
  rozklikavaciHeader: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  rozklikavaciHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});
