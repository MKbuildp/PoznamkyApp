/**
 * @description Firebase autentizační služby pro aplikaci Poznámky
 * Implementuje anonymní autentizace pro jednoduché začátky
 */

import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config';
import { useState, useEffect } from 'react';

/**
 * @description Hook pro správu Firebase autentizace
 */
export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setIsLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  /**
   * @description Anonymní přihlášení uživatele
   */
  const prihlasitAnonymne = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error: any) {
      console.error('Chyba při anonymním přihlášení:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @description Odhlášení uživatele
   */
  const odhlasit = async () => {
    try {
      await auth.signOut();
    } catch (error: any) {
      console.error('Chyba při odhlašování:', error);
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    userId: user?.uid || null,
    isAuthenticated: !!user,
    isLoading,
    error,
    prihlasitAnonymne,
    odhlasit
  };
};

/**
 * @description Získání aktuálního uživatele (synchronně)
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * @description Získání aktuálního userId (synchronně)
 * BEZ AUTENTIZACE: Používáme pevné ID pro všechny uživatele
 */
export const getCurrentUserId = (): string | null => {
  // PEVNÉ ID pro sdílení dat mezi všemi telefony
  return "public-poznamky-data";
};
