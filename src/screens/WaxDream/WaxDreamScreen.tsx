/** WaxDreamScreen - Obrazovka s komponenty z Příjmy a Domácnost */
import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// Import komponent z Příjmy
import { WaxDreamCelkovyPrehled } from './components/WaxDreamCelkovyPrehled';
import { WaxDreamFormular } from './components/WaxDreamFormular';
import { WaxDreamEditPrijemModal } from './components/WaxDreamEditPrijemModal';
import { WaxDreamEditVydajModal } from './components/WaxDreamEditVydajModal';
import { NovyZaznamButton } from '../../components/NovyZaznamButton';
import { NovyZaznamModal } from '../../components/NovyZaznamModal';

// Import hooks
import { useWaxDream, WaxDreamPrijem, WaxDreamVydaj } from './hooks/useWaxDream';

type Props = NativeStackScreenProps<RootStackParamList, 'WaxDream'>;

/**
 * @description WaxDream obrazovka s komponenty z Příjmy a Domácnost
 */
export const WaxDreamScreen: React.FC<Props> = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [aktivniTab, setAktivniTab] = useState<'prijem' | 'vydaj'>('prijem');
  const [formularVisible, setFormularVisible] = useState(false);
  const [prijmyPrehledVisible, setPrijmyPrehledVisible] = useState(false);
  const [vydajePrehledVisible, setVydajePrehledVisible] = useState(false);
  const [novyZaznamModalVisible, setNovyZaznamModalVisible] = useState(false);

  // Modální okna pro editaci
  const [editPrijemModalVisible, setEditPrijemModalVisible] = useState(false);
  const [editVydajModalVisible, setEditVydajModalVisible] = useState(false);
  const [selectedPrijem, setSelectedPrijem] = useState<WaxDreamPrijem | null>(null);
  const [selectedVydaj, setSelectedVydaj] = useState<WaxDreamVydaj | null>(null);

  // Hook pro WaxDream data
  const { state, handlers } = useWaxDream();

  // State pro formulář
  const [prijmyState, setPrijmyState] = useState({
    castka: '',
    datum: new Date(),
    isDatePickerVisible: false,
    isLoading: false,
    popis: '',
  });

  const [vydajeState, setVydajeState] = useState({
    castka: '',
    datum: new Date(),
    isDatePickerVisible: false,
    isLoading: false,
    kategorie: undefined as 'MATERIAL' | 'PROVOZ' | undefined,
    dodavatel: '',
  });

  // Handlers pro formulář
  const formularHandlers = {
    handleCastkaChange: (castka: string) => {
      if (aktivniTab === 'prijem') {
        setPrijmyState(prev => ({ ...prev, castka }));
      } else {
        setVydajeState(prev => ({ ...prev, castka }));
      }
    },
    handleDatumChange: (datum: Date) => {
      if (aktivniTab === 'prijem') {
        setPrijmyState(prev => ({ ...prev, datum }));
      } else {
        setVydajeState(prev => ({ ...prev, datum }));
      }
    },
    handleDatePickerVisibilityChange: (visible: boolean) => {
      if (aktivniTab === 'prijem') {
        setPrijmyState(prev => ({ ...prev, isDatePickerVisible: visible }));
      } else {
        setVydajeState(prev => ({ ...prev, isDatePickerVisible: visible }));
      }
    },
    handleSubmit: async () => {
      if (aktivniTab === 'prijem') {
        if (prijmyState.castka && prijmyState.popis) {
          await handlers.pridatPrijem(
            parseFloat(prijmyState.castka),
            prijmyState.datum,
            prijmyState.popis
          );
          // Reset formuláře
          setPrijmyState(prev => ({ ...prev, castka: '', popis: '' }));
        }
      } else {
        if (vydajeState.castka && vydajeState.kategorie && vydajeState.dodavatel) {
          await handlers.pridatVydaj(
            parseFloat(vydajeState.castka),
            vydajeState.datum,
            vydajeState.kategorie,
            vydajeState.dodavatel
          );
          // Reset formuláře
          setVydajeState(prev => ({ ...prev, castka: '', dodavatel: '', kategorie: undefined }));
        }
      }
    },
    handleKategorieChange: (kategorie: 'MATERIAL' | 'PROVOZ') => {
      setVydajeState(prev => ({ ...prev, kategorie }));
    },
    handleDodavatelChange: (dodavatel: string) => {
      setVydajeState(prev => ({ ...prev, dodavatel }));
    },
    handlePopisChange: (popis: string) => {
      setPrijmyState(prev => ({ ...prev, popis }));
    },
  };

  // Handlers pro modální okna
  const handleEditPrijem = (prijem: WaxDreamPrijem) => {
    setSelectedPrijem(prijem);
    setEditPrijemModalVisible(true);
  };

  const handleEditVydaj = (vydaj: WaxDreamVydaj) => {
    setSelectedVydaj(vydaj);
    setEditVydajModalVisible(true);
  };

  const handleCloseEditPrijemModal = () => {
    setEditPrijemModalVisible(false);
    setSelectedPrijem(null);
  };

  const handleCloseEditVydajModal = () => {
    setEditVydajModalVisible(false);
    setSelectedVydaj(null);
  };

  const handleSaveEditedPrijem = async (prijem: WaxDreamPrijem) => {
    try {
      await handlers.upravitPrijem(prijem);
      handleCloseEditPrijemModal();
    } catch (error) {
      console.error('Chyba při ukládání příjmu:', error);
    }
  };

  const handleSaveEditedVydaj = async (vydaj: WaxDreamVydaj) => {
    try {
      await handlers.upravitVydaj(vydaj);
      handleCloseEditVydajModal();
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
    }
  };

  /**
   * @description Handler pro uložení nového záznamu z modálního okna
   */
  const handleNovyZaznamSubmit = async (data: any) => {
    try {
      if (data.popis) {
        // Příjem
        await handlers.pridatPrijem(data.castka, data.datum, data.popis);
      } else {
        // Výdaj
        await handlers.pridatVydaj(data.castka, data.datum, data.kategorie, data.dodavatel);
      }
    } catch (error) {
      console.error('Chyba při ukládání nového záznamu:', error);
      throw error;
    }
  };

  /**
   * @description Funkce pro aktualizaci dat při pull-to-refresh
   * Real-time listener automaticky aktualizuje data, pull-to-refresh pouze resetuje loading stav
   */
  const onRefresh = async () => {
    setRefreshing(true);
    // Real-time listener automaticky aktualizuje data
    // Pull-to-refresh pouze poskytuje vizuální feedback
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 1. Celkový přehled z Příjmy */}
        <WaxDreamCelkovyPrehled
          vybranyRok={state.vybranyRok}
          celkovePrijmy={handlers.vypoctiCelkovePrijmy()}
          celkoveVydaje={handlers.vypoctiCelkoveVydaje()}
          materialVydaje={handlers.vypoctiMaterialVydaje()}
          provozVydaje={handlers.vypoctiProvozVydaje()}
          bilance={handlers.vypoctiBilance()}
          zmenitRok={(posun: number) => handlers.zmenitRok(state.vybranyRok + posun)}
          formatujCastku={handlers.formatujCastku}
        />

        {/* 2. Nové tlačítko Nový záznam */}
        <NovyZaznamButton
          onPress={() => setNovyZaznamModalVisible(true)}
          title="Nový záznam"
        />

        {/* 3. Podrobný přehled - Příjmy */}
        {/* Nové tlačítko Příjmy */}
        <NovyZaznamButton
          onPress={() => setPrijmyPrehledVisible(!prijmyPrehledVisible)}
          title="Příjmy"
          isCollapsible={true}
          isExpanded={prijmyPrehledVisible}
        />

        {prijmyPrehledVisible && (
          <View style={[styles.tabulkaKarticka, styles.uniformniRozestup]}>
            <View style={styles.podrobnyPrehledObsah}>
              {state.prijmy.filter(prijem => prijem.rok === state.vybranyRok).length === 0 ? (
                <Text style={styles.napovedaText}>
                  Žádné příjmy v roce {state.vybranyRok}
                </Text>
              ) : (
                <>
                  {/* Hlavička tabulky */}
                  <View style={styles.tableHeader}>
                    <View style={styles.datumContainerHeader}>
                      <Text style={styles.headerText}></Text>
                    </View>
                    <View style={styles.popisContainerHeader}>
                      <Text style={styles.headerText}>Popis</Text>
                    </View>
                    <View style={styles.castkaContainerHeader}>
                      <Text style={styles.headerText}>Částka</Text>
                    </View>
                  </View>

                  {/* Seznam příjmů */}
                  <View style={styles.seznamObsah}>
                    {state.prijmy
                      .filter(prijem => prijem.rok === state.vybranyRok)
                      .map((prijem) => {
                        const datum = new Date(prijem.datum);
                        const formatovaneDatum = `${datum.getDate()}.${datum.getMonth() + 1}`;

                        return (
                          <TouchableOpacity 
                            key={prijem.id} 
                            style={styles.zaznamRadek}
                            onLongPress={() => handleEditPrijem(prijem)}
                            delayLongPress={500}
                          >
                            <View style={styles.radekContent}>
                              <View style={styles.datumContainer}>
                                <Text style={styles.datumText}>{formatovaneDatum}</Text>
                              </View>
                              <View style={styles.popisContainer}>
                                <Text style={styles.popisText} numberOfLines={1} ellipsizeMode="tail">
                                  {prijem.popis}
                                </Text>
                              </View>
                              <View style={styles.castkaContainer}>
                                <Text style={styles.castkaText}>{handlers.formatujCastku(prijem.castka)}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* 4. Podrobný přehled - Výdaje */}
        {/* Nové tlačítko Výdaje */}
        <NovyZaznamButton
          onPress={() => setVydajePrehledVisible(!vydajePrehledVisible)}
          title="Výdaje"
          isCollapsible={true}
          isExpanded={vydajePrehledVisible}
        />

        {vydajePrehledVisible && (
          <View style={[styles.tabulkaKarticka, styles.uniformniRozestup]}>
            <View style={styles.podrobnyPrehledObsah}>
              {state.vydaje.filter(vydaj => vydaj.rok === state.vybranyRok).length === 0 ? (
                <Text style={styles.napovedaText}>
                  Žádné výdaje v roce {state.vybranyRok}
                </Text>
              ) : (
                <>
                  {/* Hlavička tabulky */}
                  <View style={styles.tableHeader}>
                    <View style={styles.datumContainerHeader}>
                      <Text style={styles.headerText}></Text>
                    </View>
                    <View style={styles.kategorieContainerHeader}>
                      <Text style={styles.headerText}></Text>
                    </View>
                    <View style={styles.dodavatelContainerHeader}>
                      <Text style={styles.headerText}>Dodavatel</Text>
                    </View>
                    <View style={styles.castkaContainerHeader}>
                      <Text style={styles.headerText}>Částka</Text>
                    </View>
                  </View>

                  {/* Seznam výdajů */}
                  <View style={styles.seznamObsah}>
                    {state.vydaje
                      .filter(vydaj => vydaj.rok === state.vybranyRok)
                      .map((vydaj) => {
                        const datum = new Date(vydaj.datum);
                        const formatovaneDatum = `${datum.getDate()}.${datum.getMonth() + 1}`;

                        return (
                          <TouchableOpacity 
                            key={vydaj.id} 
                            style={styles.zaznamRadek}
                            onLongPress={() => handleEditVydaj(vydaj)}
                            delayLongPress={500}
                          >
                            <View style={styles.radekContent}>
                              <View style={styles.datumContainer}>
                                <Text style={styles.datumText}>{formatovaneDatum}</Text>
                              </View>
                              <View style={styles.kategorieContainer}>
                                <View style={[
                                  styles.kategorieTecka,
                                  vydaj.kategorie === 'MATERIAL' ? styles.teckaMaterial : styles.teckaProvoz
                                ]} />
                              </View>
                              <View style={styles.dodavatelContainer}>
                                <Text style={styles.dodavatelText} numberOfLines={1} ellipsizeMode="tail">
                                  {vydaj.dodavatel}
                                </Text>
                              </View>
                              <View style={styles.castkaContainer}>
                                <Text style={styles.castkaText}>{handlers.formatujCastku(vydaj.castka)}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modální okna pro editaci */}
      <WaxDreamEditPrijemModal
        visible={editPrijemModalVisible}
        prijem={selectedPrijem}
        onClose={handleCloseEditPrijemModal}
        onSave={handleSaveEditedPrijem}
        onDelete={handlers.smazatPrijem}
      />

      <WaxDreamEditVydajModal
        visible={editVydajModalVisible}
        vydaj={selectedVydaj}
        onClose={handleCloseEditVydajModal}
        onSave={handleSaveEditedVydaj}
        onDelete={handlers.smazatVydaj}
      />

      {/* Modální okno pro nový záznam */}
      <NovyZaznamModal
        visible={novyZaznamModalVisible}
        onClose={() => setNovyZaznamModalVisible(false)}
        onSubmit={handleNovyZaznamSubmit}
        type="waxdream"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 8,
    paddingBottom: 20,
  },
  
  // Styly pro jednotné rozestupy (z Příjmy)
  uniformniRozestup: {
    marginTop: 10,
  },
  vetsiMezeraNahore: {
    marginTop: 13, // Větší mezera mezi Celkovým přehledem a první komponentou pod ním
  },
  
  // Styly pro tabulku (z Domácnost)
  tabulkaKarticka: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 0,
    elevation: 2,
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  
  // Styly pro hlavičku Podrobný přehled (z Domácnost)
  podrobnyPrehledHeaderInside: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  podrobnyPrehledHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  
  // Styly pro obsah podrobného přehledu
  podrobnyPrehledObsah: {
    padding: 0,
  },
  napovedaText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
    padding: 20,
  },
  
  // Styly pro tabulku (podle předlohy z Domácnost)
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  datumContainerHeader: {
    width: 32,
  },
  kategorieContainerHeader: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  popisContainerHeader: {
    flex: 1,
    paddingHorizontal: 2,
  },
  dodavatelContainerHeader: {
    flex: 1,
    paddingHorizontal: 2,
  },
  castkaContainerHeader: {
    width: 90,
    alignItems: 'flex-end',
  },
  
  // Styly pro seznam záznamů
  seznamObsah: {
    // Odstraněno maxHeight omezení - nyní se zobrazí všechny záznamy
  },
  zaznamRadek: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  radekContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datumContainer: {
    width: 32,
  },
  datumText: {
    fontSize: 11,
    color: '#777',
  },
  kategorieContainer: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  kategorieTecka: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teckaMaterial: {
    backgroundColor: '#2196F3', // Modrá pro materiál
  },
  teckaProvoz: {
    backgroundColor: '#FF9800', // Oranžová pro provoz
  },
  popisContainer: {
    flex: 1,
    paddingHorizontal: 2,
  },
  popisText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  dodavatelContainer: {
    flex: 1,
    paddingHorizontal: 2,
  },
  dodavatelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  castkaContainer: {
    width: 90,
    alignItems: 'flex-end',
  },
  castkaText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});
