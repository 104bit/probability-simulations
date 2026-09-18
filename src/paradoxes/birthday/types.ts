/* ============================================================
   Birthday Paradox — Types
   ============================================================ */

/** Tek bir kişinin bilgisi */
export interface Person {
  id: number;
  birthday: number; // 0-364 (gün indeksi)
  month: number;    // 0-11
  day: number;      // 1-31
  label: string;    // "14 Mar" gibi
  isMatch: boolean; // Eşleşme var mı
}

/** Tek adım sonucu (kişi eklendiğinde) */
export interface StepResult {
  person: Person;
  matchFound: boolean;
  matchWith: number | null; // Eşleşen kişinin id'si
  totalPeople: number;
  allBirthdays: number[];
}

/** Tam bir deneyin sonucu */
export interface TrialResult {
  groupSize: number;
  people: Person[];
  matchFound: boolean;
  matchDay: number | null;
  matchAtStep: number | null; // Kaçıncı kişide eşleşme bulundu
  matchPair: [number, number] | null; // Eşleşen kişilerin id'leri
}

/** Toplu simülasyon yapılandırması */
export interface BulkConfig {
  maxGroupSize: number; // Kaça kadar test edilecek (ör. 70)
  numTrials: number;    // Her grup boyutu için kaç deney
}

/** Tek bir grup boyutu için toplu sonuç */
export interface GroupSizeResult {
  groupSize: number;
  matches: number;
  total: number;
  matchRate: number;
  theoreticalRate: number;
}

/** Toplu simülasyon sonucu */
export interface BulkResult {
  numTrials: number;
  results: GroupSizeResult[];
}

/** Deney fazları */
export type ExperimentPhase =
  | 'guess'     // Tahmin aşaması
  | 'setup'     // Ayarlar
  | 'running'   // Deney çalışıyor
  | 'paused'    // Duraklatıldı
  | 'match'     // Eşleşme bulundu
  | 'complete'; // Grup tamamlandı, eşleşme yok

/** Ay isimleri */
export const MONTH_NAMES = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

/** Her ayın gün sayısı (artık yıl yok, 365 gün) */
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
