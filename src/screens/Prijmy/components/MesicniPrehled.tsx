import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';

interface MesicniPrehledProps {
  mesic: number;
  rok: number;
  celkovaCastka: number;
  nazevMesice: string;
}

/**
 * @description Komponenta pro zobrazení měsíčního přehledu tržeb s odkazem na detailní přehled
 */
export const MesicniPrehled: React.FC<MesicniPrehledProps> = ({
  mesic,
  rok,
  celkovaCastka,
  nazevMesice,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePrehledPress = () => {
    navigation.navigate('ObchodPrehled', { mesic, rok });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePrehledPress}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.mesicText}>{nazevMesice} {rok}</Text>
          <Text style={styles.infoText}>Kliknutím zobrazíte detailní přehled</Text>
        </View>
        <View style={styles.castkaContainer}>
          <Text style={styles.castkaLabel}>Celková tržba:</Text>
          <Text style={styles.castkaText}>{celkovaCastka.toLocaleString('cs-CZ')} Kč</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    gap: 12,
  },
  headerContainer: {
    gap: 4,
  },
  mesicText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
  },
  castkaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  castkaLabel: {
    fontSize: 16,
    color: '#333333',
  },
  castkaText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
}); 