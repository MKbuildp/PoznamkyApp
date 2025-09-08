/**
 * @description Typy pro obrazovku PrijmyScreen
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
  firestoreId?: string; // ID dokumentu v Firestore pro synchronizaci
}

/**
 * @description Stav pro hook usePrijmy
 */
export interface PrijmyState {
  castka: string;
  datum: Date;
  vybranyRok: number;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  rocniPrijem: number;
}

/**
 * @description Props pro FormulářPříjmů
 */
export interface FormularPrijmuProps {
  castka: string;
  datum: Date;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  onCastkaChange: (text: string) => void;
  onDatumChange: (date: Date) => void;
  onSubmit: () => void;
  onDatePickerVisibilityChange: (isVisible: boolean) => void;
}

/**
 * @description Props pro MěsíčníPřehledPříjmů
 */
export interface MesicniPrehledPrijmuProps {
  celkovaCastka: number;
  rok: number;
}

/**
 * @description Návratový typ pro hook usePrijmy
 */
export interface UsePrijmyReturn {
  state: PrijmyState;
  handlers: {
    handleCastkaChange: (text: string) => void;
    handleDatumChange: (date: Date) => void;
    handleSubmit: () => void;
    handleDatePickerVisibilityChange: (isVisible: boolean) => void;
  };
  utils: {
    formatujDatum: (date: Date) => string;
  };
} 