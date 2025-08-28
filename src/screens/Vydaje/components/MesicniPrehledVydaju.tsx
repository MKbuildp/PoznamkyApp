import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RocniPrehledVydajuProps } from '../types/types';

/**
 * @description Komponenta pro zobrazení ročního přehledu výdajů podle kategorií
 */
export const MesicniPrehledVydaju: React.FC<RocniPrehledVydajuProps> = ({
  zbozi,
  provoz,
  celkem,
  rok,
}) => {
  const formatujCastku = (castka: number): string => {
    return `${Math.round(castka).toLocaleString('cs-CZ')} Kč`;
  };

  return (
    <View style={styles.container}>
      {/* Celkové výdaje - nyní nahoře */}
      <View style={styles.celkemContainer}>
        <Text style={styles.celkemNadpis}>Celkové výdaje za rok {rok}</Text>
        <Text style={styles.celkemCastka}>{formatujCastku(celkem)}</Text>
      </View>

      {/* Kategorie výdajů - nyní dole a zmenšené */}
      <View style={[styles.kategorieContainer, styles.kategorieBorder]}>
        <View style={styles.kategorieBox}>
          <Text style={styles.kategorieNadpis}>Zboží</Text>
          <Text style={styles.castkaText}>{formatujCastku(zbozi)}</Text>
        </View>

        <View style={styles.kategorieBox}>
          <Text style={styles.kategorieNadpis}>Provoz</Text>
          <Text style={styles.castkaText}>{formatujCastku(provoz)}</Text>
        </View>
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
    borderColor: '#E53935',
  },
  celkemContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  celkemNadpis: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  celkemCastka: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53935',
  },
  kategorieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 8,
  },
  kategorieBorder: {
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  kategorieBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  kategorieNadpis: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  castkaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
}); 