import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MesicniPrehledPrijmuProps } from '../types/types';

/**
 * @description Komponenta pro zobrazení celkové tržby za aktuální kalendářní rok
 */
export const MesicniPrehledPrijmu: React.FC<MesicniPrehledPrijmuProps> = ({
  celkovaCastka,
  rok,
}) => {
  const formatujCastku = (castka: number): string => {
    return `${Math.round(castka).toLocaleString('cs-CZ')} Kč`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.celkemContainer}>
        <Text style={styles.celkemNadpis}>Celková tržba za rok {rok}</Text>
        <Text style={styles.celkemCastka}>{formatujCastku(celkovaCastka)}</Text>
      </View>
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
  celkemContainer: {
    alignItems: 'center',
  },
  celkemNadpis: {
    fontSize: 18,
    color: 'black',
    marginBottom: 4,
  },
  celkemCastka: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#43A047',
  },
}); 