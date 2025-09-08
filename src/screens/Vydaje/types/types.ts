/**
 * @description Typy pro obrazovku VydajeScreen
 */

/**
 * @description Kategorie výdajů
 */
export enum KategorieVydaju {
  ZBOZI = 'ZBOZI',
  PROVOZ = 'PROVOZ'
}

/**
 * @description Typ pro jednotlivý výdaj
 */
export interface Vydaj {
  id: string;
  castka: number;
  datum: string;
  kategorie: KategorieVydaju;
  dodavatel: string;
  firestoreId?: string; // ID dokumentu v Firestore pro synchronizaci
}

/**
 * @description Stav pro hook useVydaje
 */
export interface VydajeState {
  castka: string;
  datum: Date;
  kategorie: KategorieVydaju;
  dodavatel: string;
  vybranyRok: number;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  navrhovaniDodavateleViditelne: boolean;
  navrhyDodavatelu: string[];
  rocniVydaje: {
    zbozi: number;
    provoz: number;
    celkem: number;
  };
}

/**
 * @description Props pro FormulářVýdajů
 */
export interface FormularVydajuProps {
  castka: string;
  datum: Date;
  kategorie: KategorieVydaju;
  dodavatel: string;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  navrhovaniDodavateleViditelne: boolean;
  navrhyDodavatelu: string[];
  onCastkaChange: (text: string) => void;
  onDatumChange: (date: Date) => void;
  onKategorieChange: (kategorie: KategorieVydaju) => void;
  onDodavatelChange: (text: string) => void;
  onDodavatelSelect: (dodavatel: string) => void;
  onSubmit: () => void;
  onDatePickerVisibilityChange: (isVisible: boolean) => void;
}

/**
 * @description Props pro RocniPrehledVydaju
 */
export interface RocniPrehledVydajuProps {
  zbozi: number;
  provoz: number;
  celkem: number;
  rok: number;
}

/**
 * @description Návratový typ pro hook useVydaje
 */
export interface UseVydajeReturn {
  state: VydajeState;
  handlers: {
    handleCastkaChange: (text: string) => void;
    handleDatumChange: (date: Date) => void;
    handleKategorieChange: (kategorie: KategorieVydaju) => void;
    handleDodavatelChange: (text: string) => void;
    handleDodavatelSelect: (dodavatel: string) => void;
    handleSubmit: () => void;
    handleDatePickerVisibilityChange: (isVisible: boolean) => void;
  };
  utils: {
    formatujDatum: (date: Date) => string;
  };
} 