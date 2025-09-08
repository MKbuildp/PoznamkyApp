import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useObchodPrehled } from './hooks/useObchodPrehled';
import { DenniZaznamObchodu } from './types/types';
import { TabulkaJinychPrijmu } from './components/TabulkaJinychPrijmu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'ObchodPrehled'>;

/**
 * @description Obrazovka pro zobrazení detailního přehledu příjmů z kategorie Tržba
 */
const ObchodPrehledScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialMesic = route.params?.mesic ?? new Date().getMonth();
  const initialRok = route.params?.rok ?? new Date().getFullYear();

  const [vybranyMesic, setVybranyMesic] = useState(initialMesic);
  const [vybranyRok, setVybranyRok] = useState(initialRok);

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
    
    // Aktualizace parametrů v navigaci
    navigation.setParams({
      mesic: novyMesic,
      rok: novyRok
    });
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

  if (nacitaSe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const { levySloupec, pravySloupec } = rozdelZaznamyDoSloupcu();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Tabulka */}
      <View style={styles.tabulkaKarticka}>
        {/* Přepínač měsíců - pouze rok */}
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
              {levySloupec.map((zaznam, index) => {
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
              })}
            </View>
      </View>
      
          {/* Pravý sloupec */}
          <View style={[styles.sloupec, styles.pravySloupec]}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Den</Text>
              <Text style={[styles.headerText, { textAlign: 'right', paddingRight: 10 }]}>Částka</Text>
      </View>
            <View style={styles.sloupecObsah}>
              {pravySloupec.map((zaznam, index) => {
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
              })}
            </View>
          </View>
        </View>
      </View>

      {/* Tabulka jiných příjmů - pod tabulkou tržeb */}
      <TabulkaJinychPrijmu
        jinePrijmy={jinePrijmy}
        formatujCastku={formatujCastku}
        formatujDatum={formatujDatumZeStringu}
        onSmazat={smazatJinyPrijem}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 8,
    paddingBottom: 20,
  },
  tile: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#880E4F',
  },
  loadingContainer: {
    flex: 1,
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
});

export default ObchodPrehledScreen; 