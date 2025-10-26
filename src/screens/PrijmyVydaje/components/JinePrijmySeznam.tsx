/** JinePrijmySeznam - Komponenta pro zobrazení seznamu jiných příjmů */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface JinePrijmySeznamProps {
  jinePrijmy: Array<{
    id: string;
    popis: string;
    datum: string;
    castka: number;
  }>;
  formatujCastku: (castka: number) => string;
  formatujDatumZeStringu: (datum: string) => string;
  isCollapsible?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

/**
 * @description Komponenta pro zobrazení seznamu jiných příjmů
 */
export const JinePrijmySeznam: React.FC<JinePrijmySeznamProps> = ({
  jinePrijmy,
  formatujCastku,
  formatujDatumZeStringu,
  isCollapsible = false,
  isVisible = true,
  onToggleVisibility,
}) => {
  return (
    <View style={styles.container}>
      {/* Rozklikávací hlavička */}
      {isCollapsible && (
        <TouchableOpacity 
          style={styles.rozklikavaciHeader}
          onPress={onToggleVisibility}
        >
          <Text style={styles.rozklikavaciHeaderText}>
            Jiné příjmy {isVisible ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Obsah - zobrazí se pouze pokud není rozklikávací nebo je viditelný */}
      {(!isCollapsible || isVisible) && (
        <>
          {jinePrijmy.length === 0 ? (
            <View style={styles.prazdnyStav}>
              <Text style={styles.prazdnyStavText}>Žádné jiné příjmy</Text>
            </View>
          ) : (
            <View style={styles.jinePrijmySeznam}>
              {jinePrijmy.map((prijem) => (
                <View key={prijem.id} style={styles.jinyPrijemRadek}>
                  <View style={styles.popisContainer}>
                    <Text style={styles.popisText}>{prijem.popis || 'Bez popisu'}</Text>
                    <Text style={styles.datumText}>{formatujDatumZeStringu(prijem.datum)}</Text>
                  </View>
                  <Text style={styles.castkaText}>{formatujCastku(prijem.castka)}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.napoveda}>Dlouhým stisknutím smažete příjem</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  
  // Styly pro rozklikávací hlavičku
  rozklikavaciHeader: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  rozklikavaciHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  // Styly pro obsah
  jinePrijmySeznam: {
    maxHeight: 200,
    padding: 16,
  },
  jinyPrijemRadek: {
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
