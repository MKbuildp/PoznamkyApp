/**
 * @description Ukázková implementace PrijmyVydajeScreen s Firebase integrací
 * POZNÁMKA: Toto je ukázkový soubor. Pro aktivaci nahraď původní PrijmyVydajeScreen.tsx
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { usePrijmyVydajeFirebase } from './hooks/usePrijmyVydajeFirebase';
import { FormularPrijmu } from './components/FormularPrijmu';
import { FirebaseStatusIndikator } from './components/FirebaseStatusIndikator';
// Import dalších komponent podle potřeby...

/**
 * @description Hlavní komponenta obrazovky s Firebase integrací
 */
export const PrijmyVydajeScreenFirebase: React.FC = () => {
  // Použití rozšířeného hooku s Firebase funkcionalitou
  const {
    state,
    prijmyHandlers,
    utils,
    firebase,
    firebaseActions
  } = usePrijmyVydajeFirebase();

  // Lokální stav pro zobrazení statistik
  const [showStats, setShowStats] = useState(false);

  /**
   * @description Handler pro zobrazení statistik synchronizace
   */
  const handleShowStats = async () => {
    try {
      const stats = await firebaseActions.getStatistikySynchronizace();
      if (stats) {
        const message = Object.entries(stats)
          .map(([typ, data]: [string, any]) => 
            `${typ.toUpperCase()}:\n` +
            `  Celkem: ${data.celkem}\n` +
            `  Synchronizováno: ${data.synchronizovane}\n` +
            `  Čeká: ${data.cekajici}\n` +
            `  Chyby: ${data.chyby}`
          )
          .join('\n\n');
        
        Alert.alert('Statistiky synchronizace', message);
      }
    } catch (error) {
      Alert.alert('Chyba', 'Nepodařilo se načíst statistiky');
    }
  };

  /**
   * @description Handler pro manuální synchronizaci
   */
  const handleManualSync = async () => {
    try {
      await firebaseActions.manualniSynchronizace();
      Alert.alert('Úspěch', 'Synchronizace dokončena');
    } catch (error: any) {
      Alert.alert('Chyba', `Synchronizace selhala: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* NOVÁ KOMPONENTA: Firebase status indikátor */}
      <FirebaseStatusIndikator
        isOnline={firebase.isOnline}
        isSyncing={firebase.isSyncing}
        syncError={firebase.syncError}
        lastSyncAt={firebase.lastSyncAt}
        canSync={firebase.canSync}
        onManualSync={handleManualSync}
        onShowStats={handleShowStats}
      />

      {/* PŮVODNÍ KOMPONENTY: Formulář pro příjmy */}
      <FormularPrijmu
        castka={state.prijmy.castka}
        datum={state.prijmy.datum}
        kategorie={state.prijmy.kategorie}
        popis={state.prijmy.popis}
        isDatePickerVisible={state.prijmy.isDatePickerVisible}
        isLoading={state.prijmy.isLoading || firebase.isSyncing} // Rozšířeno o Firebase loading
        onCastkaChange={prijmyHandlers.handleCastkaChange}
        onDatumChange={prijmyHandlers.handleDatumChange}
        onKategorieChange={prijmyHandlers.handleKategorieChange}
        onPopisChange={prijmyHandlers.handlePopisChange}
        onSubmit={prijmyHandlers.handleSubmit}
        onDatePickerVisibilityChange={prijmyHandlers.handleDatePickerVisibilityChange}
      />

      {/* PŮVODNÍ KOMPONENTY: Zbytek obrazovky */}
      {/* TODO: Přidat zde zbytek komponent podle původního PrijmyVydajeScreen.tsx */}
      {/* Například: TabulkaJinychPrijmu, statistiky, atd. */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
});

export default PrijmyVydajeScreenFirebase;

