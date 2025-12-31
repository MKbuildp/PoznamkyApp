import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from '../services/firestoreService';

/**
 * @description Jednorázový migrační skript pro přesun dat z AsyncStorage do Firestore
 * Spustit pouze jednou při přechodu na real-time
 * 
 * POZNÁMKA: Tento skript by měl být spuštěn jednou před přechodem na real-time synchronizaci
 * Po úspěšné migraci lze odstranit data z AsyncStorage
 */
export const migrateToFirestore = async () => {
  try {
    console.log('Začátek migrace dat do Firestore...');

    let migratedCount = 0;

    // Migrace příjmů
    const prijmyData = await AsyncStorage.getItem('seznamPrijmuData_v2');
    if (prijmyData) {
      const prijmy = JSON.parse(prijmyData);
      for (const prijem of prijmy) {
        if (!prijem.firestoreId) {
          try {
            const firestoreId = await FirestoreService.ulozPrijem({
              castka: prijem.castka,
              datum: prijem.datum,
              kategorie: prijem.kategorie,
              popis: prijem.popis || ''
            });
            console.log(`Migrován příjem: ${firestoreId}`);
            migratedCount++;
          } catch (error) {
            console.error('Chyba při migraci příjmu:', error);
          }
        }
      }
    }

    // Migrace výdajů
    const vydajeData = await AsyncStorage.getItem('seznamVydajuData_v1');
    if (vydajeData) {
      const vydaje = JSON.parse(vydajeData);
      for (const vydaj of vydaje) {
        if (!vydaj.firestoreId) {
          try {
            const firestoreId = await FirestoreService.ulozVydaj({
              castka: vydaj.castka,
              datum: vydaj.datum,
              kategorie: vydaj.kategorie,
              dodavatel: vydaj.dodavatel || ''
            });
            console.log(`Migrován výdaj: ${firestoreId}`);
            migratedCount++;
          } catch (error) {
            console.error('Chyba při migraci výdaje:', error);
          }
        }
      }
    }

    // Migrace domácích výdajů
    const domacnostData = await AsyncStorage.getItem('domacnostVydajeData_v1');
    if (domacnostData) {
      const domacnostVydaje = JSON.parse(domacnostData);
      for (const vydaj of domacnostVydaje) {
        if (!vydaj.firestoreId) {
          try {
            const firestoreId = await FirestoreService.ulozDomacnostVydaj({
              castka: vydaj.castka,
              datum: vydaj.datum,
              kategorie: vydaj.kategorie,
              ucel: vydaj.ucel || ''
            });
            console.log(`Migrován domácí výdaj: ${firestoreId}`);
            migratedCount++;
          } catch (error) {
            console.error('Chyba při migraci domácího výdaje:', error);
          }
        }
      }
    }

    // Migrace WaxDream příjmů
    const waxdreamPrijmyData = await AsyncStorage.getItem('waxdream_prijmy');
    if (waxdreamPrijmyData) {
      const waxdreamPrijmy = JSON.parse(waxdreamPrijmyData);
      for (const prijem of waxdreamPrijmy) {
        if (!prijem.firestoreId) {
          try {
            const firestoreId = await FirestoreService.ulozWaxDreamPrijem({
              castka: prijem.castka,
              datum: prijem.datum,
              popis: prijem.popis,
              rok: prijem.rok
            });
            console.log(`Migrován WaxDream příjem: ${firestoreId}`);
            migratedCount++;
          } catch (error) {
            console.error('Chyba při migraci WaxDream příjmu:', error);
          }
        }
      }
    }

    // Migrace WaxDream výdajů
    const waxdreamVydajeData = await AsyncStorage.getItem('waxdream_vydaje');
    if (waxdreamVydajeData) {
      const waxdreamVydaje = JSON.parse(waxdreamVydajeData);
      for (const vydaj of waxdreamVydaje) {
        if (!vydaj.firestoreId) {
          try {
            const firestoreId = await FirestoreService.ulozWaxDreamVydaj({
              castka: vydaj.castka,
              datum: vydaj.datum,
              kategorie: vydaj.kategorie,
              dodavatel: vydaj.dodavatel,
              rok: vydaj.rok
            });
            console.log(`Migrován WaxDream výdaj: ${firestoreId}`);
            migratedCount++;
          } catch (error) {
            console.error('Chyba při migraci WaxDream výdaje:', error);
          }
        }
      }
    }

    console.log(`Migrace dokončena! Celkem migrováno: ${migratedCount} záznamů`);
    
    // Volitelné: Smazání AsyncStorage dat po úspěšné migraci
    // Odkomentovat pouze po ověření, že všechna data jsou v Firestore
    // await AsyncStorage.multiRemove([
    //   'seznamPrijmuData_v2',
    //   'seznamVydajuData_v1',
    //   'domacnostVydajeData_v1',
    //   'waxdream_prijmy',
    //   'waxdream_vydaje'
    // ]);
    // console.log('AsyncStorage data byla smazána');
  } catch (error) {
    console.error('Chyba při migraci:', error);
    throw error;
  }
};


