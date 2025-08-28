/**
 * @description Komponenta pro zobrazení stavu Firebase připojení a synchronizace
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FirebaseStatusIndikatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  syncError: string | null;
  lastSyncAt: Date | null;
  canSync: boolean;
  onManualSync: () => void;
  onDownloadData?: () => void;
  onShowStats?: () => void;
}

/**
 * @description Komponenta pro zobrazení Firebase stavu
 */
export const FirebaseStatusIndikator: React.FC<FirebaseStatusIndikatorProps> = ({
  isOnline,
  isSyncing,
  syncError,
  lastSyncAt,
  canSync,
  onManualSync,
  onDownloadData,
  onShowStats
}) => {
  
  /**
   * @description Získá barvu indikátoru podle stavu
   */
  const getStatusColor = (): string => {
    if (syncError) return '#ff4444';
    if (isSyncing) return '#ffaa00';
    if (isOnline) return '#44ff44';
    return '#888888';
  };

  /**
   * @description Získá text stavu
   */
  const getStatusText = (): string => {
    if (syncError) return 'Chyba synchronizace';
    if (isSyncing) return 'Synchronizuji...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  /**
   * @description Formátuje čas poslední synchronizace
   */
  const formatLastSync = (): string => {
    if (!lastSyncAt) return 'Nikdy';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Právě teď';
    if (diffMins < 60) return `Před ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Před ${diffHours} h`;
    
    return lastSyncAt.toLocaleDateString('cs-CZ');
  };

  return (
    <View style={styles.container}>
      {/* Status indikátor */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        
        {/* Tlačítka pro synchronizaci */}
        {canSync && !isSyncing && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.syncButton} 
              onPress={onManualSync}
              activeOpacity={0.7}
            >
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
            
            {onDownloadData && (
              <TouchableOpacity 
                style={[styles.syncButton, styles.downloadButton]} 
                onPress={onDownloadData}
                activeOpacity={0.7}
              >
                <Text style={styles.syncButtonText}>⬇️ Stáhnout</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Poslední synchronizace */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Poslední sync: {formatLastSync()}
        </Text>
        
        {/* Tlačítko pro statistiky (volitelné) */}
        {onShowStats && (
          <TouchableOpacity onPress={onShowStats}>
            <Text style={styles.statsButton}>Statistiky</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chybová zpráva */}
      {syncError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {syncError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  syncButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadButton: {
    backgroundColor: '#34C759',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  statsButton: {
    fontSize: 12,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    borderLeft: 3,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
  },
});

