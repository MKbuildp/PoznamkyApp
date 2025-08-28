/** Typy pro obrazovku ObchodPrehledScreen */

/**
 * @description Kategorie příjmů.
 */
export enum KategoriePrijmu {
  TRZBA = "Tržba",
  JINE = "Jiné",
}

/**
 * @description Reprezentuje jeden záznam o příjmu.
 */
export interface Prijem {
  id: string;
  castka: number;
  datum: string; // Ukládáme jako ISO string např. YYYY-MM-DDTHH:mm:ss.sssZ
  kategorie: KategoriePrijmu;
  popis?: string; // Volitelný popis pro kategorii "Jiné"
}

/**
 * @description Typ pro denní záznam v přehledu obchodu.
 */
export interface DenniZaznamObchodu {
  den: number; // Den v měsíci
  datum: string; // Celé datum ve formátu YYYY-MM-DD
  castka: number; // Celková částka za daný den
}

/**
 * @description Typ pro stav hooku useObchodPrehled.
 */
export interface ObchodPrehledState {
  denniZaznamy: DenniZaznamObchodu[];
  mesicniPrijemObchod: number;
  nacitaSe: boolean;
  vsechnyPrijmy: Prijem[]; // Pro uchování všech načtených příjmů
}

/**
 * @description Návratový typ pro hook useObchodPrehled
 */
export interface UseObchodPrehledReturn extends ObchodPrehledState {
  jinePrijmy: Prijem[];
  mesicniVydaje: number;
  formatujCastku: (castka: number) => string;
  formatujDatumZeStringu: (datum: string) => string;
  nactiData: () => Promise<void>;
  nactiJinePrijmy: () => Promise<void>;
  nactiMesicniVydaje: () => Promise<void>;
  smazatJinyPrijem: (id: string) => Promise<void>;
}

/**
 * @description Props pro ObchodPrehledScreen, pokud by byly potřeba z navigace
 */
export interface ObchodPrehledScreenParams {
  mesic?: number;
  rok?: number;
} 