/** PrijmyVydajeScreen - Sloučená obrazovka pro správu příjmů, výdajů a tržeb
 * 
 * DŮLEŽITÉ: Tato obrazovka se zobrazuje jako tab "Koloniál" v aplikaci
 * Původní název byl "Příjmy", ale uživatel ji označuje jako "Koloniál"
 * Obsahuje funkcionalitu příjmů, výdajů a tržeb
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormularPrijemVydaj } from '../../components/FormularPrijemVydaj';
import { CelkovyPrehled } from '../../components/CelkovyPrehled';
import { NovyZaznamButton } from '../../components/NovyZaznamButton';
import { NovyZaznamModal } from '../../components/NovyZaznamModal';
import { JinePrijmySeznam } from './components/JinePrijmySeznam';
import { usePrijmyVydaje } from './hooks/usePrijmyVydaje';
import { useVydaje } from '../Vydaje/hooks/useVydaje';
import { useObchodPrehled } from '../ObchodPrehledScreen/hooks/useObchodPrehled';
import { useVydajePrehled } from '../VydajePrehled/hooks/useVydajePrehled';
import { VydajeSeznam } from '../VydajePrehled/components/VydajeSeznam';
import { EditVydajModal, VydajPrijmy } from './components/EditVydajModal';
import { EditTrzbaModal } from './components/EditTrzbaModal';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';

type Props = NativeStackScreenProps<RootStackParamList, 'PrijmyVydaje'>;

/**
 * @description Sloučená obrazovka pro zadávání příjmů, výdajů a zobrazení tržeb
 * 
 * POZNÁMKA: Tato obrazovka se zobrazuje jako tab "Koloniál" v aplikaci
 * Původní název byl "Příjmy", ale uživatel ji označuje jako "Koloniál"
 */
export const PrijmyVydajeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedVydaj, setSelectedVydaj] = useState<VydajPrijmy | null>(null);
  const [editTrzbaModalVisible, setEditTrzbaModalVisible] = useState(false);
  const [selectedTrzba, setSelectedTrzba] = useState<any>(null);
  const [aktivniTab, setAktivniTab] = useState<'prijem' | 'vydaj'>('prijem');
  const [trzbyVisible, setTrzbyVisible] = useState(false);
  const [jinePrijmyVisible, setJinePrijmyVisible] = useState(false);
  const [vydajeVisible, setVydajeVisible] = useState(false);
  const [formularVisible, setFormularVisible] = useState(false);
  const [novyZaznamModalVisible, setNovyZaznamModalVisible] = useState(false);
  const { synchronizujZFirestore } = useFirestoreSync();
  
  const { 
    state, 
    prijmyHandlers, 
    utils 
  } = usePrijmyVydaje();

  // Hook pro výdaje přehled
  const { 
    vydaje,
    vybranyMesic: vydajeMesic,
    vybranyRok: vydajeRok,
    nacitaSe: vydajeNacitaSe,
    zmenitMesic: vydajeZmenitMesic,
    formatujCastku: vydajeFormatujCastku,
    getNazevMesice: vydajeGetNazevMesice,
    nactiData: vydajeNactiData,
    smazatPosledniVydaj
  } = useVydajePrehled();

  // Hook pro výdaje (formulář)
  const { 
    state: vydajeState, 
    handlers: vydajeHandlers, 
    utils: vydajeUtils 
  } = useVydaje();

  // Destrukturování editovatVydaj z handlers
  const { editovatVydaj, smazatVydaj } = vydajeHandlers;

  // State pro tržby
  const [vybranyMesic, setVybranyMesic] = useState(new Date().getMonth());
  const [vybranyRok, setVybranyRok] = useState(new Date().getFullYear());

  const {
    denniZaznamy,
    nacitaSe,
    jinePrijmy,
    formatujCastku,
    formatujDatumZeStringu,
    nactiData,
    nactiJinePrijmy,
    smazatJinyPrijem,
    editovatTrzbu,
    smazatTrzbu,
  } = useObchodPrehled(vybranyMesic, vybranyRok);

  // Přidáme useFocusEffect pro aktualizaci dat při návratu na obrazovku
  useFocusEffect(
    useCallback(() => {
      nactiData();
      nactiJinePrijmy();
      vydajeNactiData(vybranyMesic, vybranyRok);
    }, [nactiData, nactiJinePrijmy, vydajeNactiData, vybranyMesic, vybranyRok])
  );

  /**
   * @description Funkce pro aktualizaci dat při pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Synchronizace z Firebase
      await synchronizujZFirestore();
      // Aktualizace lokálních dat
      await nactiData();
      await nactiJinePrijmy();
      // Aktualizace výdajů
      await vydajeUtils.nactiRocniVydaje();
      await vydajeNactiData(vybranyMesic, vybranyRok);
      // Aktualizace příjmů
      await utils.nactiRocniPrijem();
    } catch (error) {
      console.error('Chyba při aktualizaci dat:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * @description Otevření modálního okna pro editaci výdaje
   */
  const handleEditVydaj = (vydaj: any) => {
    const vydajPrijmy: VydajPrijmy = {
      id: vydaj.id || Date.now().toString(),
      castka: vydaj.castka,
      datum: vydaj.datum,
      kategorie: vydaj.kategorie,
      dodavatel: vydaj.dodavatel,
      firestoreId: vydaj.firestoreId
    };
    setSelectedVydaj(vydajPrijmy);
    setEditModalVisible(true);
  };

  /**
   * @description Zavření modálního okna
   */
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedVydaj(null);
  };

  /**
   * @description Uložení editovaného výdaje
   */
  const handleSaveEditedVydaj = async (editedVydaj: VydajPrijmy) => {
    try {
      // Konverze VydajPrijmy na Vydaj pro hook
      const vydaj: any = {
        id: editedVydaj.id,
        castka: editedVydaj.castka,
        datum: editedVydaj.datum,
        kategorie: editedVydaj.kategorie,
        dodavatel: editedVydaj.dodavatel,
        firestoreId: editedVydaj.firestoreId
      };
      
      await editovatVydaj(vydaj);
      await nactiData(); // Aktualizace dat
    } catch (error) {
      console.error('Chyba při ukládání editovaného výdaje:', error);
      throw error;
    }
  };

  /**
   * @description Otevření modálního okna pro editaci tržby
   */
  const handleEditTrzba = (zaznam: any) => {
    // Najdeme původní tržbu v denniZaznamy podle data
    const trzba = denniZaznamy.find(d => d.datum === zaznam.datum);
    if (trzba && trzba.castka > 0) {
      // Najdeme původní příjem v AsyncStorage podle data a částky
      AsyncStorage.getItem('seznamPrijmuData_v2').then(jsonValue => {
        if (jsonValue) {
          const vsechnyPrijmy = JSON.parse(jsonValue);
          const datumPrijmu = new Date(zaznam.datum);
          
          // Najdeme příjem kategorie Tržba pro tento den
          const trzbaPrijem = vsechnyPrijmy.find((p: any) => {
            const datumP = new Date(p.datum);
            return p.kategorie === 'Tržba' && 
                   datumP.getFullYear() === datumPrijmu.getFullYear() &&
                   datumP.getMonth() === datumPrijmu.getMonth() &&
                   datumP.getDate() === datumPrijmu.getDate();
          });
          
          if (trzbaPrijem) {
            setSelectedTrzba(trzbaPrijem);
            setEditTrzbaModalVisible(true);
          } else {
            Alert.alert('Chyba', 'Tržba nebyla nalezena');
          }
        }
      }).catch(error => {
        console.error('Chyba při hledání tržby:', error);
        Alert.alert('Chyba', 'Nepodařilo se načíst tržbu');
      });
    } else {
      Alert.alert('Info', 'Pro tento den není žádná tržba k editaci');
    }
  };

  /**
   * @description Zavření modálního okna pro tržby
   */
  const handleCloseEditTrzbaModal = () => {
    setEditTrzbaModalVisible(false);
    setSelectedTrzba(null);
  };

  /**
   * @description Uložení editované tržby
   */
  const handleSaveEditedTrzba = async (editedTrzba: any) => {
    try {
      await editovatTrzbu(editedTrzba);
    } catch (error) {
      console.error('Chyba při ukládání editované tržby:', error);
      throw error;
    }
  };

  /**
   * @description Handler pro uložení nového záznamu z modálního okna
   */
  const handleNovyZaznamSubmit = async (data: any) => {
    try {
      if (data.kategorie === 'Tržba' || data.kategorie === 'Jiné') {
        // Příjem
        await prijmyHandlers.handleSubmitWithData(data);
      } else {
        // Výdaj
        await vydajeHandlers.handleSubmitWithData(data);
      }
    } catch (error) {
      console.error('Chyba při ukládání nového záznamu:', error);
      throw error;
    }
  };

  /**
   * @description Změna měsíce s kontrolou přechodu na předchozí/následující rok
   */
  const zmenitMesic = (posun: number) => {
    let novyMesic = vybranyMesic + posun;
    let novyRok = vybranyRok;

    if (novyMesic < 0) {
      novyMesic = 11; // Prosinec
      novyRok = vybranyRok - 1;
    } else if (novyMesic > 11) {
      novyMesic = 0; // Leden
      novyRok = vybranyRok + 1;
    }

    setVybranyMesic(novyMesic);
    setVybranyRok(novyRok);
    
    // Synchronizace s výdaji - aktualizujeme i výdaje pro nový měsíc
    vydajeNactiData(novyMesic, novyRok);
  };

  /**
   * @description Vrátí českou zkratku dne v týdnu
   */
  const getNazevDne = (den: number, mesic: number, rok: number): string => {
    const datum = new Date(rok, mesic, den);
    const dnyVTydnu = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return dnyVTydnu[datum.getDay()];
  };

  /**
   * @description Vrátí český název měsíce
   */
  const getNazevMesice = (mesic: number): string => {
    const mesice = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return mesice[mesic];
  };

  /**
   * @description Zjistí, zda je daný den víkend
   */
  const jeVikend = (den: number, mesic: number, rok: number): boolean => {
    const datum = new Date(rok, mesic, den);
    const denVTydnu = datum.getDay(); // 0 = neděle, 6 = sobota
    return denVTydnu === 0 || denVTydnu === 6;
  };

  /**
   * @description Rozdělí záznamy do dvou sloupců
   */
  const rozdelZaznamyDoSloupcu = () => {
    const pulka = Math.ceil(denniZaznamy.length / 2);
    return {
      levySloupec: denniZaznamy.slice(0, pulka),
      pravySloupec: denniZaznamy.slice(pulka)
    };
  };

  /**
   * @description Vypočítá celkové příjmy (Tržby + Jiné příjmy) v daném měsíci
   */
  const vypoctiCelkovePrijmy = () => {
    // Součet tržeb z denniZaznamy
    const trzby = denniZaznamy.reduce((sum, zaznam) => sum + zaznam.castka, 0);
    
    // Součet jiných příjmů
    const jinePrijmySum = jinePrijmy.reduce((sum, prijem) => sum + prijem.castka, 0);
    
    return trzby + jinePrijmySum;
  };

  /**
   * @description Vypočítá celkové výdaje (Zboží + Provoz) v daném měsíci
   */
  const vypoctiCelkoveVydaje = () => {
    // Filtrujeme výdaje pro aktuální měsíc a rok (používáme stejné proměnné jako Příjmy)
    const mesicniVydaje = vydaje.filter(vydaj => {
      const datum = new Date(vydaj.datum);
      return datum.getMonth() === vybranyMesic && datum.getFullYear() === vybranyRok;
    });
    
    // Součet výdajů za Zboží a Provoz
    const vydajeSum = mesicniVydaje.reduce((sum, vydaj) => {
      if (vydaj.kategorie === 'ZBOZI' || vydaj.kategorie === 'PROVOZ') {
        return sum + vydaj.castka;
      }
      return sum;
    }, 0);
    
    return vydajeSum;
  };

  /**
   * @description Vypočítá výdaje za Zboží v daném měsíci
   */
  const vypoctiVydajeZbozi = () => {
    const mesicniVydaje = vydaje.filter(vydaj => {
      const datum = new Date(vydaj.datum);
      return datum.getMonth() === vybranyMesic && datum.getFullYear() === vybranyRok;
    });
    
    const zboziSum = mesicniVydaje.reduce((sum, vydaj) => {
      if (vydaj.kategorie === 'ZBOZI') {
        return sum + vydaj.castka;
      }
      return sum;
    }, 0);
    return zboziSum;
  };

  /**
   * @description Vypočítá výdaje za Provoz v daném měsíci
   */
  const vypoctiVydajeProvoz = () => {
    const mesicniVydaje = vydaje.filter(vydaj => {
      const datum = new Date(vydaj.datum);
      return datum.getMonth() === vybranyMesic && datum.getFullYear() === vybranyRok;
    });
    
    const provozSum = mesicniVydaje.reduce((sum, vydaj) => {
      if (vydaj.kategorie === 'PROVOZ') {
        return sum + vydaj.castka;
      }
      return sum;
    }, 0);
    return provozSum;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']} // Android
            tintColor="#007AFF" // iOS
            title="Aktualizace dat z Firebase..."
            titleColor="#666"
          />
        }
      >
        {/* Celkový přehled - HORNÍ */}
        <CelkovyPrehled
          vybranyMesic={vybranyMesic}
          vybranyRok={vybranyRok}
          onZmenitMesic={zmenitMesic}
          prijmy={vypoctiCelkovePrijmy()}
          vydaje={vypoctiCelkoveVydaje()}
          zbozi={vypoctiVydajeZbozi()}
          provoz={vypoctiVydajeProvoz()}
          celkem={vypoctiCelkovePrijmy() - vypoctiCelkoveVydaje()}
          formatujCastku={formatujCastku}
          getNazevMesice={getNazevMesice}
        />

        {/* Nové tlačítko Nový záznam */}
        <NovyZaznamButton
          onPress={() => setNovyZaznamModalVisible(true)}
          title="Nový záznam"
        />

        {/* Sekce Tržby - dole */}
        <View>
          {nacitaSe ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <>
              {/* Tabulka tržeb - rozklikávací */}
              {/* Nové tlačítko Tržby */}
              <NovyZaznamButton
                onPress={() => setTrzbyVisible(!trzbyVisible)}
                title="Tržby"
                isCollapsible={true}
                isExpanded={trzbyVisible}
              />

              {trzbyVisible && (
                <View style={styles.tabulkaKarticka}>
                  <View style={styles.dvousloupcovaKontejner}>
                  {/* Levý sloupec */}
                  <View style={styles.sloupec}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.headerText}>Den</Text>
                      <Text style={[styles.headerText, { textAlign: 'right', paddingRight: 10 }]}>Částka</Text>
                    </View>
                    <View style={styles.sloupecObsah}>
                      {(() => {
                        const { levySloupec } = rozdelZaznamyDoSloupcu();
                        return levySloupec.map((zaznam, index) => {
                          const vikend = jeVikend(zaznam.den, vybranyMesic, vybranyRok);
                          const denVTydnu = getNazevDne(zaznam.den, vybranyMesic, vybranyRok);
                          const jePosledniRadek = index === levySloupec.length - 1;
                          return (
                            <TouchableOpacity 
                              key={zaznam.datum} 
                              style={[
                                styles.radekTabulky, 
                                jePosledniRadek && styles.posledniRadek,
                                vikend && styles.vikendovyRadek
                              ]}
                              onLongPress={() => handleEditTrzba(zaznam)}
                              delayLongPress={500}
                            >
                              <Text style={[styles.bunkaTabulkyDen, vikend && styles.vikendovyText]}>
                                <Text style={styles.poradoveCislo}>{`${zaznam.den}. `}</Text>
                                <Text style={styles.zkratkaDne}>{denVTydnu}</Text>
                              </Text>
                              <Text style={[
                                styles.bunkaTabulkyCastka,
                                zaznam.castka > 0 && styles.castkaZelena
                              ]}>
                                {formatujCastku(zaznam.castka)}
                              </Text>
                            </TouchableOpacity>
                          );
                        });
                      })()}
                    </View>
                  </View>
                  
                  {/* Pravý sloupec */}
                  <View style={[styles.sloupec, styles.pravySloupec]}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.headerText}>Den</Text>
                      <Text style={[styles.headerText, { textAlign: 'right', paddingRight: 10 }]}>Částka</Text>
                    </View>
                    <View style={styles.sloupecObsah}>
                      {(() => {
                        const { pravySloupec } = rozdelZaznamyDoSloupcu();
                        return pravySloupec.map((zaznam, index) => {
                          const vikend = jeVikend(zaznam.den, vybranyMesic, vybranyRok);
                          const denVTydnu = getNazevDne(zaznam.den, vybranyMesic, vybranyRok);
                          const jePosledniRadek = index === pravySloupec.length - 1;
                          return (
                            <TouchableOpacity 
                              key={zaznam.datum} 
                              style={[
                                styles.radekTabulky, 
                                jePosledniRadek && styles.posledniRadek,
                                vikend && styles.vikendovyRadek
                              ]}
                              onLongPress={() => handleEditTrzba(zaznam)}
                              delayLongPress={500}
                            >
                              <Text style={[styles.bunkaTabulkyDen, vikend && styles.vikendovyText]}>
                                <Text style={styles.poradoveCislo}>{`${zaznam.den}. `}</Text>
                                <Text style={styles.zkratkaDne}>{denVTydnu}</Text>
                              </Text>
                              <Text style={[
                                styles.bunkaTabulkyCastka,
                                zaznam.castka > 0 && styles.castkaZelena
                              ]}>
                                {formatujCastku(zaznam.castka)}
                              </Text>
                            </TouchableOpacity>
                          );
                        });
                      })()}
                    </View>
                  </View>
                  </View>
                </View>
              )}

              {/* Tabulka jiných příjmů - rozklikávací */}
              {/* Nové tlačítko Jiné příjmy */}
              <NovyZaznamButton
                onPress={() => setJinePrijmyVisible(!jinePrijmyVisible)}
                title="Jiné příjmy"
                isCollapsible={true}
                isExpanded={jinePrijmyVisible}
              />

              {jinePrijmyVisible && (
                <View style={styles.uniformniRozestup}>
                  <JinePrijmySeznam
                    jinePrijmy={jinePrijmy}
                    formatujCastku={formatujCastku}
                    formatujDatumZeStringu={formatujDatumZeStringu}
                    isCollapsible={false}
                    isVisible={true}
                  />
                </View>
              )}

              {/* Kontejner s výdaji - rozklikávací */}
              {/* Nové tlačítko Výdaje */}
              <NovyZaznamButton
                onPress={() => setVydajeVisible(!vydajeVisible)}
                title="Výdaje"
                isCollapsible={true}
                isExpanded={vydajeVisible}
              />

              {vydajeVisible && (
                <View style={styles.uniformniRozestup}>
                  <VydajeSeznam
                    vydaje={vydaje}
                    vybranyMesic={vybranyMesic}
                    vybranyRok={vybranyRok}
                    nacitaSe={vydajeNacitaSe}
                    formatujCastku={vydajeFormatujCastku}
                    getNazevMesice={vydajeGetNazevMesice}
                    onEditVydaj={handleEditVydaj}
                    isCollapsible={false}
                    isVisible={true}
                  />
                </View>
              )}

            </>
          )}
        </View>
      </ScrollView>

      {/* Modální okno pro editaci výdaje */}
      <EditVydajModal
        visible={editModalVisible}
        vydaj={selectedVydaj}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditedVydaj}
        onDelete={smazatVydaj}
      />

      {/* Modální okno pro editaci tržby */}
      <EditTrzbaModal
        visible={editTrzbaModalVisible}
        trzba={selectedTrzba}
        onClose={handleCloseEditTrzbaModal}
        onSave={handleSaveEditedTrzba}
        onDelete={smazatTrzbu}
      />

      {/* Modální okno pro nový záznam */}
      <NovyZaznamModal
        visible={novyZaznamModalVisible}
        onClose={() => setNovyZaznamModalVisible(false)}
        onSubmit={handleNovyZaznamSubmit}
        type="kolonial"
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

  // Styly pro jednotné rozestupy
  uniformniRozestup: {
    marginTop: 10, // Zvětšeno o 30% (8 * 1.3 = 10.4 ≈ 10)
  },
  vetsiMezeraNahore: {
    marginTop: 13, // Zvětšeno o 30% navíc (10 * 1.3 = 13)
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabulkaKarticka: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 0,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    margin: 8,
    overflow: 'hidden',
  },
  dvousloupcovaKontejner: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  sloupec: {
    flex: 1,
  },
  pravySloupec: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  sloupecObsah: {
    paddingHorizontal: 0,
  },
  radekTabulky: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  posledniRadek: {
    borderBottomWidth: 0,
  },
  vikendovyText: {
    color: '#E53935', // červená barva pro víkendy
  },
  bunkaTabulkyDen: {
    flex: 1,
    color: '#333',
    fontSize: 12,
    fontWeight: 'normal',
  },
  poradoveCislo: {
    fontSize: 11,
  },
  zkratkaDne: {
    fontWeight: 'bold',
  },
  bunkaTabulkyCastka: {
    flex: 1,
    textAlign: 'right',
    color: '#2E7D32', // zelená barva pro částku
    fontSize: 12,
    paddingRight: 10,
  },
  castkaZelena: {
    color: '#2E7D32', // zelená barva pro nenulové hodnoty
  },
  vikendovyRadek: {
    backgroundColor: '#F5F5F5',
  },


  // Styly pro rozklikávací hlavičky
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