/** PrehledScreen - Obrazovka pro zobrazení přehledu financí */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { usePrehled } from './hooks/usePrehled';
import { usePrehledTabulka } from './hooks/usePrehledTabulka';
import { PrehledTabulka } from './components/PrehledTabulka';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';

type Props = NativeStackScreenProps<RootStackParamList, 'Prehled'>;

export const PrehledScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { synchronizujZFirestore } = useFirestoreSync();
  
  const { 
    celkovePrijmy, 
    celkoveVydaje, 
    celkoveVydajeZbozi,
    celkoveVydajeProvoz,
    nacitaSe, 
    formatujCastku,
    nactiData
  } = usePrehled();
  const tabulkaHook = usePrehledTabulka();

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

  useEffect(() => {
    tabulkaHook.nactiDataProRok(tabulkaHook.vybranyRok);
  }, []);

  // Funkce pro navigaci - používáme přímé volání navigation.navigate



  if (nacitaSe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
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
      {/* Řádek s dlaždicemi Příjmy a Výdaje */}
      <View style={styles.horniRadek}>
        {/* Sekce Výdajů */}
        <TouchableOpacity 
          style={[styles.karticka, styles.polovicniKarticka, styles.vydajeKarticka]}
          onPress={() => navigation.navigate('PrijmyVydaje')}
        >
          <View style={styles.obsahKarticky}>
            <View style={styles.headerKarticky}>
              <Text style={styles.nadpisKarticky}>Výdaje</Text>
            </View>
            <View style={styles.castkaContainer}>
              <Text style={[styles.castkaText, styles.vydajeCastka]}>
                {formatujCastku(celkoveVydaje)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Sekce Příjmů */}
        <TouchableOpacity 
          style={[styles.karticka, styles.polovicniKarticka, styles.prijmyKarticka]}
          onPress={() => navigation.navigate('PrijmyVydaje')}
        >
          <View style={styles.obsahKarticky}>
            <View style={styles.headerKarticky}>
              <Text style={styles.nadpisKarticky}>Příjmy</Text>
            </View>
            <View style={styles.castkaContainer}>
              <Text style={[styles.castkaText, styles.prijmyCastka]}>
                {formatujCastku(celkovePrijmy)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sekce Bilance */}
      <View style={[styles.karticka, styles.bilanceKarticka]}>
        <View style={styles.obsahKarticky}>
          <View style={styles.headerKarticky}>
            <Text style={styles.nadpisKarticky}>Bilance</Text>
          </View>
          <View style={styles.bilanceObsah}>
            {/* Levý sloupec s kategoriemi výdajů */}
            <View style={styles.kategorieVydaju}>
              <View style={styles.kategorieRadek}>
                <Text style={styles.kategorieLabel}>Zboží:</Text>
                <Text style={[styles.kategorieCastka, styles.vydajeCastka]}>
                  {formatujCastku(celkoveVydajeZbozi)}
                </Text>
              </View>
              <View style={styles.kategorieRadek}>
                <Text style={styles.kategorieLabel}>Provoz:</Text>
                <Text style={[styles.kategorieCastka, styles.vydajeCastka]}>
                  {formatujCastku(celkoveVydajeProvoz)}
                </Text>
              </View>
            </View>
            {/* Pravý sloupec s celkovou bilancí */}
            <View style={styles.celkovaBilance}>
              <Text style={styles.celkovaBilanceLabel}>Celková bilance:</Text>
              <Text 
                style={[
                  styles.bilanceCastkaText, 
                  celkovePrijmy - celkoveVydaje >= 0 ? styles.prijmyCastka : styles.vydajeCastka
                ]}
              >
                {formatujCastku(celkovePrijmy - celkoveVydaje)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabulka s měsíčním přehledem */}
      <PrehledTabulka 
        rocniData={tabulkaHook.rocniData}
        vybranyRok={tabulkaHook.vybranyRok}
        nacitaSe={tabulkaHook.nacitaSe}
        zmenitRok={tabulkaHook.zmenitRok}
        formatujCastku={tabulkaHook.formatujCastku}
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
    padding: 16,
    paddingBottom: 50, // Optimalizovaný prostor pro Tab Bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horniRadek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 0,
    width: '100%',
  },
  karticka: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  polovicniKarticka: {
    width: '48.5%',
  },
  vydajeKarticka: {
    borderWidth: 2,
    borderColor: '#880E4F',
  },
  prijmyKarticka: {
    borderWidth: 2,
    borderColor: '#880E4F',
  },
  bilanceKarticka: {
    borderWidth: 2,
    borderColor: '#880E4F',
  },
  obsahKarticky: {
    padding: 6,
    alignItems: 'center',
  },
  headerKarticky: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  nadpisKarticky: {
    fontSize: 19,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  castkaContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  castkaLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  castkaText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  bilanceCastkaText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  vydajeCastka: {
    color: '#E53935',
  },
  prijmyCastka: {
    color: '#43A047',
  },

  bilanceObsah: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 8,
  },
  kategorieVydaju: {
    flex: 1,
    marginRight: 16,
  },
  kategorieRadek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kategorieLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  kategorieCastka: {
    fontSize: 14,
    fontWeight: '500',
  },
  celkovaBilance: {
    flex: 1,
    alignItems: 'flex-end',
  },
  celkovaBilanceLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  vydajeTile: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#880E4F',
  },
  prijmyTile: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#880E4F',
  },
}); 