/** DomacnostScreen - Obrazovka pro správu domácích výdajů */
import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { FormularDomacnosti } from './components/FormularDomacnosti';
import { useDomacnost } from './hooks/useDomacnost';
import { KategorieDomacnostVydaju } from './types/types';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';

/**
 * @description Obrazovka pro zadávání domácích výdajů a zobrazení tabulky
 */
const DomacnostScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
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
    nactiData,
    zmenitMesic,
    vybranyMesic,
    vybranyRok,
    getNazevMesice,
    getNazevDne,
    jeVikend,
    rozdelZaznamyDoSloupcu,
    smazatPosledniVydaj,
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
              <View style={[styles.tabulkaBunka, { borderRightWidth: 0 }]}>
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
            <View style={[styles.tabulkaRadek, { borderBottomWidth: 0 }]}>
              {/* Jídlo */}
              <View style={styles.tabulkaBunka}>
                <Text style={styles.druhaKategorieNazev}>Jídlo</Text>
                <Text style={[styles.druhaKategorieCastka, styles.jidloCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie === KategorieDomacnostVydaju.JIDLO)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
              
              {/* Jiné */}
              <View style={styles.tabulkaBunka}>
                <Text style={styles.druhaKategorieNazev}>Jiné</Text>
                <Text style={[styles.druhaKategorieCastka, styles.jineCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie === KategorieDomacnostVydaju.JINE)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
              
              {/* Pravidelné */}
              <View style={[styles.tabulkaBunka, { borderRightWidth: 0 }]}>
                <Text style={styles.druhaKategorieNazev}>Pravidelné</Text>
                <Text style={[styles.druhaKategorieCastka, styles.pravidelneCastka]}>
                  {formatujCastku(mesicniVydaje
                    .filter(v => v.kategorie === KategorieDomacnostVydaju.PRAVIDELNE)
                    .reduce((sum, v) => sum + v.castka, 0)
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Formulář pro domácí výdaje - DRUHÝ */}
        <FormularDomacnosti
          castka={state.castka}
          datum={state.datum}
          kategorie={state.kategorie}
          ucel={state.ucel}
          isDatePickerVisible={state.isDatePickerVisible}
          isLoading={state.isLoading}
          onCastkaChange={handleCastkaChange}
          onDatumChange={handleDatumChange}
          onKategorieChange={handleKategorieChange}
          onUcelChange={handleUcelChange}
          onSubmit={handleSubmit}
          onDatePickerVisibilityChange={handleDatePickerVisibilityChange}
          onSmazatPosledni={smazatPosledniVydaj}
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
                                zaznam.castka > 0 && styles.castkaFialova
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
                                zaznam.castka > 0 && styles.castkaFialova
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



              {/* Seznam jednotlivých výdajů - DOLE */}
              <View style={styles.seznamContainer}>

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

                    {/* Seznam výdajů (bez příjmů) */}
                    <View style={styles.seznamObsah}>
                      {mesicniVydaje.filter(vydaj => vydaj.kategorie !== KategorieDomacnostVydaju.PRIJEM).map((vydaj) => {
                        const datum = new Date(vydaj.datum);
                        const den = datum.getDate().toString().padStart(2, '0');
                        const mesic = (datum.getMonth() + 1).toString().padStart(2, '0');
                        const formatovaneDatum = `${den}.${mesic}.`;
                        
                        // Určení textu pro účel
                        const ucelText = vydaj.kategorie === KategorieDomacnostVydaju.JIDLO 
                          ? (vydaj.ucel && vydaj.ucel.trim() ? vydaj.ucel : 'Jídlo')
                          : vydaj.kategorie === KategorieDomacnostVydaju.PRAVIDELNE
                          ? (vydaj.ucel && vydaj.ucel.trim() ? vydaj.ucel : 'Pravidelné')
                          : (vydaj.ucel && vydaj.ucel.trim() ? vydaj.ucel : 'Jiné');



                        return (
                          <View key={vydaj.id} style={styles.vydajRadek}>
                            <View style={styles.radekContent}>
                              <View style={styles.datumContainer}>
                                <Text style={styles.datumText}>{formatovaneDatum}</Text>
                              </View>
                              <View style={styles.kategorieContainer}>
                                <View style={[
                                  styles.kategorieTecka,
                                  vydaj.kategorie === KategorieDomacnostVydaju.JIDLO ? styles.teckaJidlo : 
                                  vydaj.kategorie === KategorieDomacnostVydaju.PRAVIDELNE ? styles.teckaPravidelne : 
                                  styles.teckaJine
                                ]} />
                              </View>
                              <View style={styles.ucelContainer}>
                                <Text style={styles.ucelText} numberOfLines={1} ellipsizeMode="tail">
                                  {ucelText}
                                </Text>
                              </View>
                              <View style={styles.castkaVydajeContainer}>
                                <Text style={styles.castkaVydajeText}>{formatujCastku(vydaj.castka)}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}
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
  // Styly pro tabulku
  tabulkaSekce: {
    marginTop: 20,
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
    borderColor: '#9C27B0', // Fialová pro domácnost
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
    color: '#9C27B0', // Fialová barva pro částku
    fontSize: 12,
    paddingRight: 10,
  },
  castkaFialova: {
    color: '#9C27B0', // Fialová barva pro nenulové hodnoty
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
    borderColor: '#9C27B0',
    overflow: 'hidden',
  },
  tabulkaRadek: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#9C27B0',
    minHeight: 50,
  },
  tabulkaBunka: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: '#9C27B0',
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
  },
  mesicTlacitkoTextHorni: {
    fontSize: 18,
    color: '#9C27B0',
    fontWeight: 'bold',
  },

  hlavniKategorieNazev: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hlavniKategorieCastka: {
    fontSize: 20,
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
    fontWeight: '600',
  },
  prijemCastka: {
    color: '#4CAF50', // Zelená pro příjmy
  },
  vydajeCastka: {
    color: '#E53935', // Červená pro výdaje
  },
  jidloCastka: {
    color: '#2196F3', // Modrá pro jídlo
  },
  jineCastka: {
    color: '#FF9800', // Oranžová pro jiné
  },
  pravidelneCastka: {
    color: '#9C27B0', // Fialová pro pravidelné
  },
  // Styly pro seznam výdajů
  seznamContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#9C27B0',
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#000',
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
    color: '#9C27B0',
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

});

export default DomacnostScreen;