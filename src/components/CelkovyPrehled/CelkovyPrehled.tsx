import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CelkovyPrehledProps {
  vybranyMesic: number;
  vybranyRok: number;
  onZmenitMesic: (posun: number) => void;
  prijmy: number;
  vydaje: number;
  zbozi: number;
  provoz: number;
  celkem: number;
  formatujCastku: (castka: number) => string;
  getNazevMesice: (mesic: number) => string;
}

export const CelkovyPrehled: React.FC<CelkovyPrehledProps> = ({
  vybranyMesic,
  vybranyRok,
  onZmenitMesic,
  prijmy,
  vydaje,
  zbozi,
  provoz,
  celkem,
  formatujCastku,
  getNazevMesice,
}) => {
  return (
    <View style={styles.celkemContainer}>
      {/* První řádek - Měsíc s přepínáním (1 buňka) */}
      <View style={styles.tabulkaRadek}>
        <TouchableOpacity 
          style={styles.mesicTlacitkoHorni} 
          onPress={() => onZmenitMesic(-1)}
        >
          <Text style={styles.mesicTlacitkoTextHorni}>{'<'}</Text>
        </TouchableOpacity>
        <View style={[styles.tabulkaBunka, { borderRightWidth: 0, backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.celkemNadpis}>{getNazevMesice(vybranyMesic)} {vybranyRok}</Text>
        </View>
        <TouchableOpacity 
          style={styles.mesicTlacitkoHorni} 
          onPress={() => onZmenitMesic(1)}
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
            {formatujCastku(prijmy)}
          </Text>
        </View>
        
        {/* Výdaje */}
        <View style={[styles.tabulkaBunka, { borderRightWidth: 0 }]}>
          <Text style={styles.hlavniKategorieNazev}>Výdaje</Text>
          <Text style={[styles.hlavniKategorieCastka, styles.vydajeCastka]}>
            {formatujCastku(vydaje)}
          </Text>
        </View>
      </View>
      
      {/* Třetí řádek - Zboží, Provoz (2 buňky) */}
      <View style={styles.tabulkaRadek}>
        {/* Zboží */}
        <View style={styles.tabulkaBunka}>
          <View style={styles.kategorieNazevContainer}>
            <View style={[styles.kategoriePuntik, styles.puntikZbozi]} />
            <Text style={styles.druhaKategorieNazev}>Zboží</Text>
          </View>
          <Text style={[styles.druhaKategorieCastka, styles.zboziCastka]}>
            {formatujCastku(zbozi)}
          </Text>
        </View>
        
        {/* Provoz */}
        <View style={[styles.tabulkaBunka, { borderRightWidth: 0 }]}>
          <View style={styles.kategorieNazevContainer}>
            <View style={[styles.kategoriePuntik, styles.puntikProvoz]} />
            <Text style={styles.druhaKategorieNazev}>Provoz</Text>
          </View>
          <Text style={[styles.druhaKategorieCastka, styles.provozCastka]}>
            {formatujCastku(provoz)}
          </Text>
        </View>
      </View>
      
      {/* Čtvrtý řádek - Celkem (1 buňka přes celou šířku) */}
      <View style={[styles.tabulkaRadek, { borderBottomWidth: 0 }]}>
        <View style={[styles.tabulkaBunka, { borderRightWidth: 0, flex: 1 }]}>
          <Text style={styles.celkemNazev}>Celkem</Text>
          <Text style={[
            styles.celkemCastka,
            celkem >= 0 ? styles.celkemPozitivni : styles.celkemNegativni
          ]}>
            {formatujCastku(celkem)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  celkemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  tabulkaRadek: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    minHeight: 50,
  },
  tabulkaBunka: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: '#E0E0E0',
  },
  mesicTlacitkoHorni: {
    padding: 4,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
  },
  mesicTlacitkoTextHorni: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  celkemNadpis: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
  prijemCastka: {
    color: '#4CAF50',
  },
  vydajeCastka: {
    color: '#E53935',
  },
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
  puntikZbozi: {
    backgroundColor: '#2196F3', // Modrá pro zboží
  },
  puntikProvoz: {
    backgroundColor: '#FF9800', // Oranžová pro provoz
  },
  druhaKategorieNazev: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  druhaKategorieCastka: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  zboziCastka: {
    color: '#000000',
  },
  provozCastka: {
    color: '#000000',
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
