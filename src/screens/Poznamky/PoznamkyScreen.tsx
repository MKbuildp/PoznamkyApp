/** DomacnostScreen - Obrazovka pro správu domácích výdajů */
import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { FormularDomacnostiV2 } from './components/FormularDomacnostiV2';
import { EditVydajModal } from './components/EditVydajModal';
import { NovyZaznamButton } from '../../components/NovyZaznamButton';
import { NovyZaznamModal } from '../../components/NovyZaznamModal';
import { useDomacnost } from './hooks/useDomacnost';
import { KategorieDomacnostVydaju, DomacnostVydaj } from './types/types';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';

/**
 * @description Obrazovka pro zadávání domácích výdajů a zobrazení tabulky
 */
const DomacnostScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedVydaj, setSelectedVydaj] = useState<DomacnostVydaj | null>(null);
  // Stavy pro rozklikávání komponent - defaultně sbalené
  const [formularVisible, setFormularVisible] = useState(false);
  const [denniPrehledVisible, setDenniPrehledVisible] = useState(false);
  const [podrobnyPrehledVisible, setPodrobnyPrehledVisible] = useState(false);
  const [novyZaznamModalVisible, setNovyZaznamModalVisible] = useState(false);
  const { synchronizujZFirestore } = useFirestoreSync();
  
  const {
    state,
    mesicniVydaje,
    formatujCastku,
    formatujDatum,
    handleCastkaChange,
    handleDatumChange,
    handleKategorieChange,
    handleUcelChange,
    handleDatePickerVisibilityChange,
    handleSubmit,
    handleSubmitWithData,
    nactiData,
    zmenitMesic,
    vybranyMesic,
    vybranyRok,
    getNazevMesice,
    getNazevDne,
    jeVikend,
    rozdelZaznamyDoSloupcu,
    smazatPosledniVydaj,
    editovatVydaj,
    smazatVydaj,
  } = useDomacnost();

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
    } catch (error) {
      console.error('Chyba při aktualizaci dat:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * @description Otevření modálního okna pro editaci výdaje
   */
  const handleEditVydaj = (vydaj: DomacnostVydaj) => {
    setSelectedVydaj(vydaj);
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
  const handleSaveEditedVydaj = async (editedVydaj: DomacnostVydaj) => {
    await editovatVydaj(editedVydaj);
  };

  /**
   * @description Handler pro uložení nového záznamu z modálního okna
   */
  const handleNovyZaznamSubmit = async (data: any) => {
    try {
      await handleSubmitWithData(data);
    } catch (error) {
      console.error('Chyba při ukládání nového záznamu:', error);
      throw error;
    }
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
        {/* Tabulka celkového přehledu - HORNÍ */}
        {!state.nacitaSe && (
          <View style={styles.celkemContainer}>
            {/* První řádek - Měsíc s přepínáním (1 buňka) */}
            <View style={styles.tabulkaRadek}>
              <TouchableOpacity 
                style={styles.mesicTlacitkoHorni} 
                onPress={() => zmenitMesic(-1)}
              >
                <Text style={styles.mesicTlacitkoTextHorni}>{'<'}</Text>
              </TouchableOpacity>
              <View style={[styles.tabulkaBunka, { borderRightWidth: 0, backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.celkemNadpis}>{getNazevMesice(vybranyMesic)} {vybranyRok}</Text>
              </View>
              <TouchableOpacity 
                style={styles.mesicTlacitkoHorni} 
                onPress={() => zmenitMesic(1)}
              >
                <Text style={styles.mesicTlacitkoTextHorni}>{'>'}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Druhý řádek - Příjmy a Výdaje (2 buňky) */}
            <View style={styles.tabulkaRadek}>
              {/* Příjmy */}
              <View style={styles.tabulkaBunka}>
                <Text style={styles.hlavniKategorieNazev}>Příjmy</Text>
                <Text style={[styles.hlavniKategorieCastka, styles.prijemCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie === KategorieDomacnostVydaju.PRIJEM)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
              
              {/* Výdaje */}
              <View style={[styles.tabulkaBunka, { borderRightWidth: 0 }]}>
                <Text style={styles.hlavniKategorieNazev}>Výdaje</Text>
                <Text style={[styles.hlavniKategorieCastka, styles.vydajeCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie !== KategorieDomacnostVydaju.PRIJEM)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
            </View>
            
            {/* Třetí řádek - Jídlo, Jiné, Pravidelné (3 buňky) */}
            <View style={styles.tabulkaRadek}>
              {/* Jídlo */}
              <View style={styles.tabulkaBunka}>
                <View style={styles.kategorieNazevContainer}>
                  <View style={[styles.kategoriePuntik, styles.puntikJidlo]} />
                  <Text style={styles.druhaKategorieNazev}>Jídlo</Text>
                </View>
                <Text style={[styles.druhaKategorieCastka, styles.jidloCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie === KategorieDomacnostVydaju.JIDLO)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
              
              {/* Jiné */}
              <View style={styles.tabulkaBunka}>
                <View style={styles.kategorieNazevContainer}>
                  <View style={[styles.kategoriePuntik, styles.puntikJine]} />
                  <Text style={styles.druhaKategorieNazev}>Jiné</Text>
                </View>
                <Text style={[styles.druhaKategorieCastka, styles.jineCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie === KategorieDomacnostVydaju.JINE)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
              
              {/* Pravidelné */}
              <View style={styles.tabulkaBunka}>
                <View style={styles.kategorieNazevContainer}>
                  <View style={[styles.kategoriePuntik, styles.puntikPravidelne]} />
                  <Text style={styles.druhaKategorieNazev}>Pravidelné</Text>
                </View>
                <Text style={[styles.druhaKategorieCastka, styles.pravidelneCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie === KategorieDomacnostVydaju.PRAVIDELNE)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
            </View>
            
            {/* Čtvrtý řádek - Celkem (1 buňka přes celou šířku) */}
            <View style={[styles.tabulkaRadek, { borderBottomWidth: 0 }]}>
              <View style={[styles.tabulkaBunka, { borderRightWidth: 0, flex: 1 }]}>
                <Text style={styles.celkemNazev}>Celkem</Text>
                <Text style={[
                  styles.celkemCastka,
                  (() => {
                    const prijmy = mesicniVydaje
                      .filter(v => v.kategorie === KategorieDomacnostVydaju.PRIJEM)
                      .reduce((sum, v) => sum + v.castka, 0);
                    const vydaje = mesicniVydaje
                      .filter(v => v.kategorie !== KategorieDomacnostVydaju.PRIJEM)
                      .reduce((sum, v) => sum + v.castka, 0);
                    const celkem = prijmy - vydaje;
                    return celkem >= 0 ? styles.celkemPozitivni : styles.celkemNegativni;
                  })()
                ]}>
                  {formatujCastku((() => {
                    const prijmy = mesicniVydaje
                      .filter(v => v.kategorie === KategorieDomacnostVydaju.PRIJEM)
                      .reduce((sum, v) => sum + v.castka, 0);
                    const vydaje = mesicniVydaje
                      .filter(v => v.kategorie !== KategorieDomacnostVydaju.PRIJEM)
                      .reduce((sum, v) => sum + v.castka, 0);
                    return prijmy - vydaje;
                  })())}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Nové tlačítko Nový záznam */}
        <NovyZaznamButton
          onPress={() => setNovyZaznamModalVisible(true)}
          title="Nový záznam"
        />

        {/* Měsíční přehled - TŘETÍ */}
        <View style={styles.tabulkaSekce}>
          
          {state.nacitaSe ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9C27B0" />
            </View>
          ) : (
            <>
              {/* Tabulka domácích výdajů */}
              {/* Nové tlačítko Denní přehled */}
              <NovyZaznamButton
                onPress={() => setDenniPrehledVisible(!denniPrehledVisible)}
                title="Denní přehled"
                isCollapsible={true}
                isExpanded={denniPrehledVisible}
              />

              {denniPrehledVisible && (
                <View style={[styles.tabulkaKarticka, styles.uniformniRozestup]}>
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
                                zaznam.castka > 0 ? styles.castkaCervena : styles.castkaCerna
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
                                zaznam.castka > 0 ? styles.castkaCervena : styles.castkaCerna
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
              )}



              {/* Seznam jednotlivých výdajů - DOLE */}
              {/* Nové tlačítko Podrobný přehled */}
              <NovyZaznamButton
                onPress={() => setPodrobnyPrehledVisible(!podrobnyPrehledVisible)}
                title="Podrobný přehled"
                isCollapsible={true}
                isExpanded={podrobnyPrehledVisible}
              />

              {podrobnyPrehledVisible && (
                <View style={[styles.seznamContainer, styles.uniformniRozestup]}>
                  <>
                    {mesicniVydaje.length === 0 ? (
                      <View style={styles.prazdnyStav}>
                        <Text style={styles.prazdnyStavText}>Žádné výdaje v {getNazevMesice(vybranyMesic)} {vybranyRok}</Text>
                      </View>
                    ) : (
                      <>
                        {/* Záhlaví tabulky */}
                        <View style={styles.tableHeader}>
                      <View style={styles.datumContainerHeader}>
                        <Text style={styles.headerText}></Text>
                      </View>
                      <View style={styles.kategorieContainerHeader}>
                        <Text style={styles.headerText}></Text>
                      </View>
                      <View style={styles.ucelContainerHeader}>
                        <Text style={styles.headerText}>Účel</Text>
                      </View>
                      <View style={styles.castkaContainerHeader}>
                        <Text style={styles.headerText}>Částka</Text>
                      </View>
                    </View>

                    {/* Seznam všech záznamů (výdaje i příjmy) */}
                    <View style={styles.seznamObsah}>
                      {mesicniVydaje.map((vydaj) => {
                        const datum = new Date(vydaj.datum);
                        const den = datum.getDate().toString().padStart(2, '0');
                        const mesic = (datum.getMonth() + 1).toString().padStart(2, '0');
                        const formatovaneDatum = `${den}.${mesic}.`;
                        
                        // Určení textu pro účel
                        const ucelText = vydaj.kategorie === KategorieDomacnostVydaju.JIDLO 
                          ? (vydaj.ucel && vydaj.ucel.trim() ? vydaj.ucel : 'Jídlo')
                          : vydaj.kategorie === KategorieDomacnostVydaju.PRAVIDELNE
                          ? (vydaj.ucel && vydaj.ucel.trim() ? vydaj.ucel : 'Pravidelné')
                          : vydaj.kategorie === KategorieDomacnostVydaju.PRIJEM
                          ? (vydaj.ucel && vydaj.ucel.trim() ? vydaj.ucel : 'Příjem')
                          : (vydaj.ucel && vydaj.ucel.trim() ? vydaj.ucel : 'Jiné');

                        return (
                          <TouchableOpacity 
                            key={vydaj.id} 
                            style={styles.vydajRadek}
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
                                  vydaj.kategorie === KategorieDomacnostVydaju.JIDLO ? styles.teckaJidlo : 
                                  vydaj.kategorie === KategorieDomacnostVydaju.PRAVIDELNE ? styles.teckaPravidelne : 
                                  vydaj.kategorie === KategorieDomacnostVydaju.PRIJEM ? styles.teckaPrijem :
                                  styles.teckaJine
                                ]} />
                              </View>
                              <View style={styles.ucelContainer}>
                                <Text style={styles.ucelText} numberOfLines={1} ellipsizeMode="tail">
                                  {ucelText}
                                </Text>
                              </View>
                              <View style={styles.castkaVydajeContainer}>
                                <Text style={[
                                  styles.castkaVydajeText,
                                  vydaj.kategorie === KategorieDomacnostVydaju.PRIJEM ? styles.castkaPrijemText : styles.castkaVydajeText
                                ]}>{formatujCastku(vydaj.castka)}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                    )}
                  </>
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

      {/* Modální okno pro nový záznam */}
      <NovyZaznamModal
        visible={novyZaznamModalVisible}
        onClose={() => setNovyZaznamModalVisible(false)}
        onSubmit={handleNovyZaznamSubmit}
        type="domacnost"
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
  // Styly pro tabulku
  tabulkaSekce: {
    // Odstraněn marginTop pro jednotné rozestupy
  },

  // Styly pro hlavičku Denní přehled uvnitř tabulky
  denniPrehledHeaderInside: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  denniPrehledHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  // Styly pro hlavičku Podrobný přehled uvnitř tabulky
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
    margin: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  uniformniRozestup: {
    marginTop: 10, // Zvětšeno o 30% (8 * 1.3 = 10.4 ≈ 10)
  },
  vetsiMezeraNahore: {
    marginTop: 13, // Zvětšeno o 30% navíc (10 * 1.3 = 13)
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
    borderLeftColor: '#E0E0E0', // Změněno z černé na šedou
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Změněno z černé na šedou
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0', // Změněno z černé na šedou
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
    color: '#000000', // Základní černá barva
    fontSize: 13, // Změněno z 12 na 13
    paddingRight: 10,
  },
  castkaFialova: {
    color: '#E53935', // Červená barva pro nenulové hodnoty
  },
  castkaCervena: {
    color: '#E53935', // Červená barva pro nenulové hodnoty
  },
  castkaCerna: {
    color: '#000000', // Černá barva pro nulové hodnoty
  },
  vikendovyRadek: {
    backgroundColor: '#F5F5F5',
  },
  // Styly pro celkovou částku
  celkemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0', // Stejná barva jako FormularDomacnostiV2
    overflow: 'hidden',
  },
  tabulkaRadek: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0', // Šedé čáry jako FormularDomacnostiV2
    minHeight: 50,
  },
  tabulkaBunka: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: '#E0E0E0', // Šedé čáry jako FormularDomacnostiV2
  },
  celkemNadpis: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  celkemCastka: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    textAlign: 'center',
    marginTop: 8,
  },

  mesicTlacitkoHorni: {
    padding: 4,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0', // Šedé pozadí pro přepínací prvky
  },
  mesicTlacitkoTextHorni: {
    fontSize: 18,
    color: '#000000', // Černá barva pro šipky
    fontWeight: 'bold',
  },

  hlavniKategorieNazev: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hlavniKategorieCastka: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  druhaKategorieNazev: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  druhaKategorieCastka: {
    fontSize: 16,
    fontWeight: 'normal', // Odstraněno tučné písmo
  },
  prijemCastka: {
    color: '#4CAF50', // Zelená pro příjmy
  },
  vydajeCastka: {
    color: '#E53935', // Červená pro výdaje
  },
  jidloCastka: {
    color: '#000000', // Černá barva pro jídlo
  },
  jineCastka: {
    color: '#000000', // Černá barva pro jiné
  },
  pravidelneCastka: {
    color: '#000000', // Černá barva pro pravidelné
  },
  
  // Styly pro barevné puntíky
  kategorieNazevContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  kategoriePuntik: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  puntikJidlo: {
    backgroundColor: '#2196F3', // Modrá pro jídlo
  },
  puntikJine: {
    backgroundColor: '#FF9800', // Oranžová pro jiné
  },
  puntikPravidelne: {
    backgroundColor: '#9C27B0', // Fialová pro pravidelné
  },
  // Styly pro seznam výdajů
  seznamContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0', // Stejná barva jako FormularDomacnostiV2
    margin: 8,
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Změněno z černé na šedou
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0', // Změněno z černé na šedou
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
  ucelContainerHeader: {
    flex: 1,
    paddingHorizontal: 2,
  },
  castkaContainerHeader: {
    width: 90,
    alignItems: 'flex-end',
  },
  seznamObsah: {
    // Odstraněno maxHeight omezení - nyní se zobrazí všechny výdaje
  },
  vydajRadek: {
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
  teckaJidlo: {
    backgroundColor: '#2196F3', // Modrá pro jídlo
  },
  teckaJine: {
    backgroundColor: '#FF9800', // Oranžová pro jiné
  },
  teckaPravidelne: {
    backgroundColor: '#9C27B0', // Fialová pro pravidelné
  },
  teckaPrijem: {
    backgroundColor: '#4CAF50', // Zelená pro příjmy
  },
  ucelContainer: {
    flex: 1,
    paddingHorizontal: 2,
  },
  ucelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  castkaVydajeContainer: {
    width: 90,
    alignItems: 'flex-end',
  },
  castkaVydajeText: {
    fontSize: 13,
    color: '#E53935', // Červená barva místo černé
  },
  castkaPrijemText: {
    fontSize: 13,
    color: '#4CAF50', // Zelená barva pro příjmy
  },
  prazdnyStav: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  prazdnyStavText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  celkemNazev: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  celkemCastka: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  celkemPozitivni: {
    color: '#4CAF50', // Zelená pro kladný výsledek
  },
  celkemNegativni: {
    color: '#E53935', // Červená pro záporný výsledek
  },

});

export default DomacnostScreen;