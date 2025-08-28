/** PrijmyVydajeScreen - Sloučená obrazovka pro správu příjmů, výdajů a tržeb */
import React, { useCallback, useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FormularPrijmu } from './components/FormularPrijmu';
import { FirebaseStatusIndikator } from './components/FirebaseStatusIndikator';
import { usePrijmyVydajeFirebase } from './hooks/usePrijmyVydajeFirebase';
import { useObchodPrehled } from '../ObchodPrehledScreen/hooks/useObchodPrehled';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'PrijmyVydaje'>;

/**
 * @description Sloučená obrazovka pro zadávání příjmů, výdajů a zobrazení tržeb
 */
export const PrijmyVydajeScreen: React.FC<Props> = ({ navigation }) => {
    const {
    state, 
    prijmyHandlers, 
    utils,
    firebase,
    firebaseActions
  } = usePrijmyVydajeFirebase();

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
    smazatJinyPrijem
  } = useObchodPrehled(vybranyMesic, vybranyRok);

  // Přidáme useFocusEffect pro aktualizaci dat při návratu na obrazovku
  useFocusEffect(
    useCallback(() => {
      nactiData();
      nactiJinePrijmy();
    }, [nactiData, nactiJinePrijmy])
  );

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
      >
        {/* Firebase Status Indikátor */}
        <FirebaseStatusIndikator
          isOnline={firebase.isOnline}
          isSyncing={firebase.isSyncing}
          syncError={firebase.syncError}
          lastSyncAt={firebase.lastSyncAt}
          canSync={firebase.canSync}
          onManualSync={firebaseActions.manualniSynchronizace}
          onDownloadData={async () => {
            try {
              // Import syncService pro přímé volání
              const { syncService } = await import('../../../services/storage/syncService');
              await syncService.stahniDataZFirebase();
              
              // Refresh všechny obrazovky
              window.location.reload(); // Pro webový Expo Go
              alert('Data byla stažena z Firebase!');
            } catch (error: any) {
              alert(`Chyba při stahování: ${error.message}`);
            }
          }}
          onShowStats={async () => {
            const stats = await firebaseActions.getStatistikySynchronizace();
            if (stats) {
              const message = Object.entries(stats)
                .map(([typ, data]: [string, any]) => 
                  `${typ.toUpperCase()}:\n` +
                  `  Celkem: ${data.celkem}\n` +
                  `  Synchronizováno: ${data.synchronizovane}\n` +
                  `  Čeká: ${data.cekajici}\n` +
                  `  Chyby: ${data.chyby}`
                )
                .join('\n\n');
              alert(`Statistiky synchronizace:\n\n${message}`);
            }
          }}
        />

        {/* Formulář pro příjmy - nahoře */}
        <FormularPrijmu
          castka={state.prijmy.castka}
          datum={state.prijmy.datum}
          kategorie={state.prijmy.kategorie}
          popis={state.prijmy.popis}
          isDatePickerVisible={state.prijmy.isDatePickerVisible}
          isLoading={state.prijmy.isLoading}
          onCastkaChange={prijmyHandlers.handleCastkaChange}
          onDatumChange={prijmyHandlers.handleDatumChange}
          onKategorieChange={prijmyHandlers.handleKategorieChange}
          onPopisChange={prijmyHandlers.handlePopisChange}
          onSubmit={prijmyHandlers.handleSubmit}
          onDatePickerVisibilityChange={prijmyHandlers.handleDatePickerVisibilityChange}
        />

        {/* Tlačítko pro smazání posledního příjmu */}
        <TouchableOpacity 
          style={styles.smazatTlacitko}
          onPress={prijmyHandlers.smazatPosledniPrijem}
        >
          <Text style={styles.smazatTlacitkoText}>🗑️ Smazat poslední příjem</Text>
        </TouchableOpacity>

        {/* Sekce Tržby - dole */}
        <View style={styles.trzbySekce}>
          <Text style={styles.trzbyNadpis}>Tržby</Text>
          
          {nacitaSe ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <>
              {/* Tabulka tržeb */}
              <View style={styles.tabulkaKarticka}>
                {/* Přepínač měsíců */}
                <View style={styles.mesicPrepinac}>
                  <TouchableOpacity 
                    style={styles.mesicTlacitko} 
                    onPress={() => zmenitMesic(-1)}
                  >
                    <Text style={styles.mesicTlacitkoText}>{'<'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.mesicText}>
                    {`${getNazevMesice(vybranyMesic)} ${vybranyRok}`}
                  </Text>
                  <TouchableOpacity 
                    style={styles.mesicTlacitko} 
                    onPress={() => zmenitMesic(1)}
                  >
                    <Text style={styles.mesicTlacitkoText}>{'>'}</Text>
                  </TouchableOpacity>
                </View>

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
                            <View 
                              key={zaznam.datum} 
                              style={[
                                styles.radekTabulky, 
                                jePosledniRadek && styles.posledniRadek,
                                vikend && styles.vikendovyRadek
                              ]}
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
                            </View>
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
                            <View 
                              key={zaznam.datum} 
                              style={[
                                styles.radekTabulky, 
                                jePosledniRadek && styles.posledniRadek,
                                vikend && styles.vikendovyRadek
                              ]}
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
                            </View>
                          );
                        });
                      })()}
                    </View>
                  </View>
                </View>
              </View>

              {/* Tabulka jiných příjmů - pod tabulkou tržeb (bez FlatList) */}
              <View style={styles.jinePrijmyContainer}>
                <Text style={styles.jinePrijmyNadpis}>Jiné příjmy</Text>
                {jinePrijmy.length === 0 ? (
                  <View style={styles.prazdnyStav}>
                    <Text style={styles.prazdnyStavText}>Žádné jiné příjmy</Text>
                  </View>
                ) : (
                  <View style={styles.jinePrijmySeznam}>
                    {jinePrijmy.map((prijem) => (
                      <View key={prijem.id} style={styles.jinyPrijemRadek}>
                        <View style={styles.popisContainer}>
                          <Text style={styles.popisText}>{prijem.popis || 'Bez popisu'}</Text>
                          <Text style={styles.datumText}>{formatujDatumZeStringu(prijem.datum)}</Text>
                        </View>
                        <Text style={styles.castkaText}>{formatujCastku(prijem.castka)}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.napoveda}>Dlouhým stisknutím smažete příjem</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  // Nové styly pro tržby
  trzbySekce: {
    marginTop: 20,
  },
  trzbyNadpis: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
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
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: '#880E4F',
    margin: 8,
    overflow: 'hidden',
  },
  mesicPrepinac: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mesicTlacitko: {
    padding: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  mesicTlacitkoText: {
    fontSize: 20,
    color: '#880E4F',
  },
  mesicText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: '#333',
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
    borderLeftColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#000',
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

  // Styly pro jiné příjmy (bez FlatList)
  jinePrijmyContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#880E4F',
  },
  jinePrijmyNadpis: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  jinePrijmySeznam: {
    maxHeight: 200,
  },
  jinyPrijemRadek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  popisContainer: {
    flex: 1,
    marginRight: 12,
  },
  popisText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  datumText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  castkaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#43A047',
  },
  prazdnyStav: {
    padding: 20,
    alignItems: 'center',
  },
  prazdnyStavText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  napoveda: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  smazatTlacitko: {
    backgroundColor: '#FF5252',
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  smazatTlacitkoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 