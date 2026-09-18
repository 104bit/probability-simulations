/* ============================================================
   Monty Hall — Types
   ============================================================ */

export type Strategy = 'stay' | 'switch';

export type DoorState = 
  | 'closed'      // Kapalı kapı
  | 'selected'    // Oyuncu seçti
  | 'revealed'    // Sunucu açtı (keçi)
  | 'won'         // Kazanan kapı (araba)
  | 'lost'        // Kaybeden kapı (keçi, oyuncunun son seçimi)
  | 'unselected'; // Seçilmemiş, kapalı kalmış

export interface DoorInfo {
  index: number;
  hasPrize: boolean;
  state: DoorState;
}

export interface GameConfig {
  numDoors: number;
  strategy: Strategy;
  /** Deterministic seçimler için (test amaçlı) */
  prizeDoor?: number;
  playerChoice?: number;
}

export interface GameResult {
  numDoors: number;
  strategy: Strategy;
  prizeDoor: number;
  playerInitialChoice: number;
  revealedDoor: number;
  playerFinalChoice: number;
  won: boolean;
  doors: DoorInfo[];
}

export interface BulkConfig {
  numDoors: number;
  numTrials: number;
}

export interface StrategyResult {
  strategy: Strategy;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
  theoreticalRate: number;
}

export interface BulkResult {
  numDoors: number;
  numTrials: number;
  stay: StrategyResult;
  switch: StrategyResult;
}

export type GamePhase = 
  | 'setup'       // Henüz başlamadı
  | 'selecting'   // Kapı seçimi animasyonu
  | 'revealing'   // Sunucu kapı açıyor
  | 'deciding'    // Strateji uygulanıyor
  | 'result';     // Sonuç gösteriliyor
