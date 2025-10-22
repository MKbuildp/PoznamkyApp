/** VydajeSeznam - Komponenta pro zobrazení seznamu všech výdajů */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { VydajeSeznamProps } from '../types/types';

/**
 * @description Komponenta pro zobrazení seznamu všech výdajů
 */
export const VydajeSeznam: React.FC<VydajeSeznamProps> = ({
  vydaje,
  vybranyMesic,
  vybranyRok,
  nacitaSe,
  zmenitMesic,
  formatujCastku,
  getNazevMesice,
}) => {
  if (nacitaSe) {
    return (
      <View style={styles.container}>
        <View style={styles.rokPrepinac}>
          <TouchableOpacity 
            style={styles.rokTlacitko} 
            onPress={() => zmenitMesic(-1)}
          >
            <Text style={styles.rokTlacitkoText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.rokText}>{`${getNazevMesice(vybranyMesic)} ${vybranyRok}`}</Text>
          <TouchableOpacity 
            style={styles.rokTlacitko} 
            onPress={() => zmenitMesic(1)}
          >
            <Text style={styles.rokTlacitkoText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Načítání dat...</Text>
        </View>
      </View>
    );
  }

  if (vydaje.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.rokPrepinac}>
          <TouchableOpacity 
            style={styles.rokTlacitko} 
            onPress={() => zmenitMesic(-1)}
          >
            <Text style={styles.rokTlacitkoText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.rokText}>{`${getNazevMesice(vybranyMesic)} ${vybranyRok}`}</Text>
          <TouchableOpacity 
            style={styles.rokTlacitko} 
            onPress={() => zmenitMesic(1)}
          >
            <Text style={styles.rokTlacitkoText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Žádné výdaje v {getNazevMesice(vybranyMesic)} {vybranyRok}</Text>
          <Text style={styles.emptySubText}>Přidejte výdaje v sekci Příjmy/Výdaje/Tržby</Text>
        </View>
      </View>
    );
  }

  // Renderování položky seznamu
  const renderItem = ({ item }: { item: any }) => {
    const datum = new Date(item.datum);
    const den = datum.getDate().toString().padStart(2, '0');
    const mesic = (datum.getMonth() + 1).toString().padStart(2, '0');
    const formatovaneDatum = `${den}.${mesic}.`;
    
    return (
      <View style={styles.radekTabulky}>
        <View style={styles.radekContent}>
          <View style={styles.datumContainer}>
            <Text style={styles.datumText}>{formatovaneDatum}</Text>
          </View>
          <View style={styles.kategorieContainer}>
            <View style={[
              styles.kategorieTecka,
              item.kategorie === 'ZBOZI' ? styles.teckaZbozi : styles.teckaProvoz
            ]} />
          </View>
          <View style={styles.dodavatelContainer}>
            <Text style={styles.dodavatelText} numberOfLines={1} ellipsizeMode="tail">
              {item.dodavatel}
            </Text>
          </View>
          <View style={styles.castkaContainer}>
            <Text style={styles.castkaText}>
              {formatujCastku(item.castka)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Přepínač měsíců */}
      <View style={styles.rokPrepinac}>
        <TouchableOpacity 
          style={styles.rokTlacitko} 
          onPress={() => zmenitMesic(-1)}
        >
          <Text style={styles.rokTlacitkoText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.rokText}>{`${getNazevMesice(vybranyMesic)} ${vybranyRok}`}</Text>
        <TouchableOpacity 
          style={styles.rokTlacitko} 
          onPress={() => zmenitMesic(1)}
        >
          <Text style={styles.rokTlacitkoText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Záhlaví tabulky */}
      <View style={styles.tableHeader}>
        <View style={styles.datumContainer}>
          <Text style={styles.headerText}></Text>
        </View>
        <View style={styles.kategorieContainer}>
          <Text style={styles.headerText}></Text>
        </View>
        <View style={styles.dodavatelContainer}>
          <Text style={styles.headerText}>Dodavatel</Text>
        </View>
        <View style={styles.castkaContainer}>
          <Text style={styles.headerText}>Částka</Text>
        </View>
      </View>

      {/* Seznam výdajů */}
      <View style={styles.flatList}>
        {vydaje.map((item, index) => (
          <View key={`${item.datum}-${index}`}>
            {renderItem({ item })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#880E4F',
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
    color: '#880E4F',
  },
  rokText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: '#333',
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  radekTabulky: {
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
  teckaZbozi: {
    backgroundColor: '#93C572',
  },
  teckaProvoz: {
    backgroundColor: '#FF9800',
  },
  dodavatelContainer: {
    flex: 1,
    paddingHorizontal: 2,
    width: '55%',
  },
  dodavatelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  castkaContainer: {
    width: 90,
    alignItems: 'flex-end',
  },
  castkaText: {
    fontSize: 13,
    color: '#E53935',
  },
  flatList: {
    // Odstraněno maxHeight omezení pro zobrazení všech výdajů
  },
  flatListContent: {
    flexGrow: 1,
  },
}); 