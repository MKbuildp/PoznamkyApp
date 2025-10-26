/** TypeScript typy pro obrazovku Domácnost */

/** Kategorie domácích výdajů */
export enum KategorieDomacnostVydaju {
  JIDLO = "Jídlo",
  JINE = "Jiné",
  PRAVIDELNE = "Pravidelné",
  PRIJEM = "Příjem",
}

/** Rozhraní pro jeden domácí výdaj */
export interface DomacnostVydaj {
  id: string;
  castka: number;
  datum: string; // ISO string formát
  kategorie: KategorieDomacnostVydaju;
  ucel?: string; // Účel - povinný pouze pro kategorii "Jiné"
  firestoreId?: string; // ID dokumentu v Firestore pro synchronizaci
}

/** Typ pro denní záznam v přehledu domácnosti */
export interface DenniZaznamDomacnosti {
  den: number; // Den v měsíci
  datum: string; // Celé datum ve formátu YYYY-MM-DD
  castka: number; // Celková částka za daný den
}

/** Stav pro hook useDomacnost */
export interface DomacnostState {
  // Formulář
  castka: string;
  datum: Date;
  kategorie: KategorieDomacnostVydaju | undefined;
  ucel: string;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  
  // Data
  denniZaznamy: DenniZaznamDomacnosti[];
  mesicniCelkem: number;
  nacitaSe: boolean;
  vsechnyVydaje: DomacnostVydaj[];
}

/** Návratový typ pro hook useDomacnost */
export interface UseDomacnostReturn {
  state: DomacnostState;
  mesicniVydaje: DomacnostVydaj[];
  formatujCastku: (castka: number) => string;
  formatujDatum: (datum: string) => string;
  handleCastkaChange: (text: string) => void;
  handleDatumChange: (datum: Date) => void;
  handleKategorieChange: (kategorie: KategorieDomacnostVydaju) => void;
  handleUcelChange: (text: string) => void;
  handleDatePickerVisibilityChange: (visible: boolean) => void;
  handleSubmit: () => Promise<void>;
  nactiData: () => Promise<void>;
  zmenitMesic: (posun: number) => void;
  vybranyMesic: number;
  vybranyRok: number;
  getNazevMesice: (mesic: number) => string;
  getNazevDne: (den: number, mesic: number, rok: number) => string;
  jeVikend: (den: number, mesic: number, rok: number) => boolean;
  rozdelZaznamyDoSloupcu: () => {
    levySloupec: DenniZaznamDomacnosti[];
    pravySloupec: DenniZaznamDomacnosti[];
  };
  smazatPosledniVydaj: () => void;
  editovatVydaj: (editedVydaj: DomacnostVydaj) => Promise<void>;
}

/** Props pro komponentu FormularDomacnosti */
export interface FormularDomacnostiProps {
  castka: string;
  datum: Date;
  kategorie: KategorieDomacnostVydaju;
  ucel: string;
  isDatePickerVisible: boolean;
  isLoading: boolean;
  onCastkaChange: (text: string) => void;
  onDatumChange: (datum: Date) => void;
  onKategorieChange: (kategorie: KategorieDomacnostVydaju) => void;
  onUcelChange: (text: string) => void;
  onSubmit: () => void;
  onDatePickerVisibilityChange: (visible: boolean) => void;
  onSmazatPosledni: () => void;
}