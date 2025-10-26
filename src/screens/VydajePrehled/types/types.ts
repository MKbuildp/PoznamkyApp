/**
 * @description Typy pro obrazovku VydajePrehled
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
 * @description Typ pro záznam dodavatele s celkovou částkou výdajů
 */
export interface DodavatelVydaj {
  dodavatel: string;
  castka: number;
  procentoPodil?: number; // Procentuální podíl na celkových výdajích
}

/**
 * @description Props pro tabulku dodavatelů
 */
export interface DodavateleTabulkaProps {
  vydajePodleDodavatelu: DodavatelVydaj[];
  vybranyMesic: number;
  vybranyRok: number;
  nacitaSe: boolean;
  zmenitMesic: (posun: number) => void;
  formatujCastku: (castka: number) => string;
  getNazevMesice: (mesic: number) => string;
}

/**
 * @description Props pro seznam výdajů
 */
export interface VydajeSeznamProps {
  vydaje: Array<{
    datum: string;
    kategorie: 'ZBOZI' | 'PROVOZ';
    dodavatel: string;
    castka: number;
  }>;
  vybranyMesic: number;
  vybranyRok: number;
  nacitaSe: boolean;
  formatujCastku: (castka: number) => string;
  getNazevMesice: (mesic: number) => string;
  onEditVydaj?: (vydaj: any) => void;
  isCollapsible?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
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
  onCastkaChange: (text: string) => void;
  onDatumChange: (date: Date) => void;
  onKategorieChange: (kategorie: KategorieVydaju) => void;
  onDodavatelChange: (text: string) => void;
  onSubmit: () => void;
  onDatePickerVisibilityChange: (isVisible: boolean) => void;
}
