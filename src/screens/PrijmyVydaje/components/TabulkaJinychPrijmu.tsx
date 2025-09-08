import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Prijem } from '../types/types';

interface TabulkaJinychPrijmuProps {
  jinePrijmy: Prijem[];
  formatujCastku: (castka: number) => string;
  formatujDatum: (datum: string) => string;
  onSmazat: (id: string) => void;
}

/**
 * @description Komponenta pro zobrazení tabulky příjmů kategorie "Jiné"
 */
export const TabulkaJinychPrijmu: React.FC<TabulkaJinychPrijmuProps> = ({
  jinePrijmy,
  formatujCastku,
  formatujDatum,
  onSmazat,
}) => {
  const potvrdSmazani = (id: string, popis: string) => {
    Alert.alert(
      'Smazat příjem',
      `Opravdu chcete smazat příjem "${popis}"?`,
      [
        { text: 'Zrušit', style: 'cancel' },
        { text: 'Smazat', onPress: () => onSmazat(id), style: 'destructive' }
      ]
    );
  };

  const renderItem = ({ item }: { item: Prijem }) => (
    <TouchableOpacity
      style={styles.radek}
      onLongPress={() => potvrdSmazani(item.id, item.popis || 'Neznámý popis')}
    >
      <View style={styles.popisContainer}>
        <Text style={styles.popisText}>{item.popis || 'Bez popisu'}</Text>
        <Text style={styles.datumText}>{formatujDatum(item.datum)}</Text>
      </View>
      <Text style={styles.castkaText}>{formatujCastku(item.castka)}</Text>
    </TouchableOpacity>
  );

  if (jinePrijmy.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.nadpis}>Jiné příjmy</Text>
        <View style={styles.prazdnyStav}>
          <Text style={styles.prazdnyStavText}>Žádné jiné příjmy</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.nadpis}>Jiné příjmy</Text>
      <View style={styles.seznam}>
        {jinePrijmy.map((item) => (
          <View key={item.id}>
            {renderItem({ item })}
          </View>
        ))}
      </View>
      <Text style={styles.napoveda}>Dlouhým stisknutím smažete příjem</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#43A047',
  },
  nadpis: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  seznam: {
    maxHeight: 200,
  },
  radek: {
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
}); 