import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

interface MesicniData {
  mesic: number;
  vydaje: number;
  prijmy: number;
  bilance: number;
}

interface PrehledTabulkaProps {
  rocniData: MesicniData[];
  vybranyRok: number;
  nacitaSe: boolean;
  zmenitRok: (rok: number) => void;
  formatujCastku: (castka: number) => string;
}

/**
 * @description Komponenta pro zobrazení tabulky s přehledem financí po měsících
 */
export const PrehledTabulka: React.FC<PrehledTabulkaProps> = ({
  rocniData,
  vybranyRok,
  nacitaSe,
  zmenitRok,
  formatujCastku
}) => {
  const getNazevMesice = (mesic: number): string => {
    const mesice = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return mesice[mesic];
  };

  if (nacitaSe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Přepínač roků */}
      <View style={styles.rokPrepinac}>
        <TouchableOpacity 
          style={styles.rokTlacitko} 
          onPress={() => zmenitRok(vybranyRok - 1)}
        >
          <Text style={styles.rokTlacitkoText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.rokText}>{vybranyRok}</Text>
        <TouchableOpacity 
          style={styles.rokTlacitko} 
          onPress={() => zmenitRok(vybranyRok + 1)}
        >
          <Text style={styles.rokTlacitkoText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Záhlaví tabulky */}
      <View style={styles.tableHeader}>
        <Text style={[styles.bunka, styles.headerText]}>Měsíc</Text>
        <Text style={[styles.bunka, styles.headerText]}>Výdaje</Text>
        <Text style={[styles.bunka, styles.headerText]}>Příjmy</Text>
        <Text style={[styles.bunka, styles.headerText]}>Bilance</Text>
      </View>

      {/* Řádky tabulky */}
      {rocniData.map((data) => (
        <View key={data.mesic} style={styles.radekTabulky}>
          <Text style={[styles.bunka, styles.mesicText]}>
            {getNazevMesice(data.mesic)}
          </Text>
          <Text style={[styles.bunka, styles.vydajeText]}>
            {formatujCastku(data.vydaje)}
          </Text>
          <Text style={[styles.bunka, styles.prijmyText]}>
            {formatujCastku(data.prijmy)}
          </Text>
          <Text style={[styles.bunka, data.bilance >= 0 ? styles.kladnaBilance : styles.zapornaBilance]}>
            {formatujCastku(data.bilance)}
          </Text>
        </View>
      ))}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 0,
    marginTop: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#880E4F', // vínová barva
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  rokPrepinac: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rokTlacitko: {
    padding: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  rokTlacitkoText: {
    fontSize: 20,
    color: '#880E4F', // vínová barva pro tlačítka přepínače
  },
  rokText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: '#333',
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
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  radekTabulky: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bunka: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  zahlaviText: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 14,
  },
  mesicText: {
    textAlign: 'left',
    color: '#333',
    fontWeight: '500',
  },
  vydajeText: {
    color: '#E53935',
  },
  prijmyText: {
    color: '#43A047',
  },
  kladnaBilance: {
    color: '#43A047',
    fontWeight: '500',
  },
  zapornaBilance: {
    color: '#E53935',
    fontWeight: '500',
  },
}); 