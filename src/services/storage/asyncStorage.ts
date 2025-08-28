/**
 * @description Wrapper pro AsyncStorage s typovou bezpečností
 * Zachovává kompatibilitu se stávajícím kódem
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * @description Typově bezpečný wrapper pro AsyncStorage
 */
export class TypedAsyncStorage {
  /**
   * @description Uloží data do AsyncStorage
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Chyba při ukládání do AsyncStorage (${key}):`, error);
      throw error;
    }
  }

  /**
   * @description Načte data z AsyncStorage
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Chyba při načítání z AsyncStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * @description Smaže položku z AsyncStorage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Chyba při mazání z AsyncStorage (${key}):`, error);
      throw error;
    }
  }

  /**
   * @description Vymaže všechny data z AsyncStorage
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Chyba při mazání všech dat z AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * @description Získá všechny klíče z AsyncStorage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Chyba při získávání klíčů z AsyncStorage:', error);
      return [];
    }
  }
}

// Zachování zpětné kompatibility - export původního AsyncStorage
export default AsyncStorage;


