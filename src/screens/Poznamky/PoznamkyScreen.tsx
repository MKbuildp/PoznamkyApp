/** DomacnostScreen - Obrazovka pro správu domácích výdajů */
import React from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FormularDomacnosti } from './components/FormularDomacnosti';
import { useDomacnost } from './hooks/useDomacnost';
import { KategorieDomacnostVydaju } from './types/types';

/**
 * @description Obrazovka pro zadávání domácích výdajů a zobrazení tabulky
 */
const DomacnostScreen: React.FC = () => {
  const {
    state,
    mesicniVydaje,
    formatujCastku,
    formatujDatum,
    handleCastkaChange,
    handleDatumChange,
    handleKategorieChange,
    handleDatePickerVisibilityChange,
    handleSubmit,
    zmenitMesic,
    vybranyMesic,
    vybranyRok,
    getNazevMesice,
    getNazevDne,
    jeVikend,
    rozdelZaznamyDoSloupcu,
    smazatPosledniVydaj,
  } = useDomacnost();

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
        {/* Formulář pro domácí výdaje */}
        <FormularDomacnosti
          castka={state.castka}
          datum={state.datum}
          kategorie={state.kategorie}
          isDatePickerVisible={state.isDatePickerVisible}
          isLoading={state.isLoading}
          onCastkaChange={handleCastkaChange}
          onDatumChange={handleDatumChange}
          onKategorieChange={handleKategorieChange}
          onSubmit={handleSubmit}
          onDatePickerVisibilityChange={handleDatePickerVisibilityChange}
        />

        {/* Tlačítko pro smazání posledního výdaje */}
        <TouchableOpacity 
          style={styles.smazatTlacitko}
          onPress={smazatPosledniVydaj}
        >
          <Text style={styles.smazatTlacitkoText}>🗑️ Smazat poslední výdaj</Text>
        </TouchableOpacity>

        {/* Sekce Domácí výdaje - tabulka */}
        <View style={styles.tabulkaSekce}>
          <Text style={styles.tabulkaNadpis}>Domácí výdaje</Text>
          
          {state.nacitaSe ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9C27B0" />
            </View>
          ) : (
            <>
              {/* Tabulka domácích výdajů */}
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

              {/* Celková částka za měsíc */}
              <View style={styles.celkemContainer}>
                <Text style={styles.celkemNadpis}>Celkem za {getNazevMesice(vybranyMesic)} {vybranyRok}</Text>
                <Text style={styles.celkemCastka}>{formatujCastku(state.mesicniCelkem)}</Text>
              </View>

              {/* Seznam všech výdajů za měsíc */}
              <View style={styles.seznamContainer}>
                <Text style={styles.seznamNadpis}>Výdaje za {getNazevMesice(vybranyMesic)} {vybranyRok}</Text>
                {mesicniVydaje.length === 0 ? (
                  <View style={styles.prazdnyStav}>
                    <Text style={styles.prazdnyStavText}>Žádné výdaje v tomto měsíci</Text>
                  </View>
                ) : (
                  <View style={styles.seznamObsah}>
                    {mesicniVydaje.map((vydaj) => (
                      <View key={vydaj.id} style={styles.vydajRadek}>
                        <View style={styles.datumContainer}>
                          <Text style={styles.datumText}>{formatujDatum(vydaj.datum)}</Text>
                        </View>
                        <View style={styles.kategorieContainer}>
                          <View style={[
                            styles.kategorieTecka,
                            vydaj.kategorie === KategorieDomacnostVydaju.JIDLO ? styles.teckaJidlo : styles.teckaJine
                          ]} />
                        </View>
                        <View style={styles.castkaVydajeContainer}>
                          <Text style={styles.castkaVydajeText}>{formatujCastku(vydaj.castka)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
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
  tabulkaNadpis: {
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
    borderColor: '#9C27B0', // Fialová pro domácnost
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
    color: '#9C27B0',
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
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#9C27B0',
    alignItems: 'center',
  },
  celkemNadpis: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  celkemCastka: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    textAlign: 'center',
  },
  // Styly pro seznam výdajů
  seznamContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  seznamNadpis: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  seznamObsah: {
    maxHeight: 300, // Omezíme výšku, aby se obrazovka nepřetahovala
  },
  vydajRadek: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datumContainer: {
    flex: 2,
  },
  datumText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  kategorieContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kategorieTecka: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  teckaJidlo: {
    backgroundColor: '#4CAF50', // Zelená pro jídlo
  },
  teckaJine: {
    backgroundColor: '#FF9800', // Oranžová pro jiné
  },
  castkaVydajeContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  castkaVydajeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
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

export default DomacnostScreen;