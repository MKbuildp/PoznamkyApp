/**
 * @description Typy pro sloučenou obrazovku PrijmyVydaje
 */

import { KategoriePrijmu } from '../../ObchodPrehledScreen/types/types';

/**
 * @description Typ pro jednotlivý příjem
 */
export interface Prijem {
  id: string;
  castka: number;
  datum: string;
  kategorie: KategoriePrijmu;
  popis?: string; // Volitelný popis pro kategorii "Jiné"
  firestoreId?: string; // ID dokumentu v Firestore pro synchronizaci
}

/**
 * @description Stav pro hook usePrijmyVydaje
 */
export interface PrijmyVydajeState {
  // Stav pro příjmy
  prijmy: {
    castka: string;
    datum: Date;
    kategorie: KategoriePrijmu | undefined;
    popis: string;
    vybranyRok: number;
    isDatePickerVisible: boolean;
    isLoading: boolean;
    rocniPrijem: number;
  };
}

/**
 * @description Props pro FormulářPříjmů
 */
export interface FormularPrijmuProps {
  castka: string;
  datum: Date;
  kategorie: KategoriePrijmu | undefined;
  popis: string;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  onCastkaChange: (text: string) => void;
  onDatumChange: (date: Date) => void;
  onKategorieChange: (kategorie: KategoriePrijmu) => void;
  onPopisChange: (text: string) => void;
  onSubmit: () => void;
  onDatePickerVisibilityChange: (isVisible: boolean) => void;
}



/**
 * @description Návratový typ pro hook usePrijmyVydaje
 */
export interface UsePrijmyVydajeReturn {
  state: PrijmyVydajeState;
  prijmyHandlers: {
    handleCastkaChange: (text: string) => void;
    handleDatumChange: (date: Date) => void;
    handleKategorieChange: (kategorie: KategoriePrijmu) => void;
    handlePopisChange: (text: string) => void;
    handleSubmit: () => void;
    handleDatePickerVisibilityChange: (isVisible: boolean) => void;
    smazatPosledniPrijem: () => void;
  };
  utils: {
    formatujDatum: (date: Date) => string;
    nactiRocniPrijem: () => Promise<void>;
  };
} 