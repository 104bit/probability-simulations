/* ============================================================
   Martingale Betting Paradox — Types
   ============================================================ */

/** Tek bir turun sonucu */
export interface RoundResult {
  round: number;
  bet: number;
  won: boolean;
  payout: number;        // kazanç: +bet veya kayıp: -bet
  bankroll: number;      // tur sonrası bakiye
  consecutiveLosses: number;
}

/** Oturum yapılandırması */
export interface SessionConfig {
  initialBankroll: number;
  baseBet: number;
  winProbability: number; // 0-1 arası (0.5 = adil, 0.4737 = rulet)
  maxRounds: number;
  targetProfit: number | null; // hedefe ulaşınca dur (null = limitsiz)
}

/** Tam oturum sonucu */
export interface SessionResult {
  rounds: RoundResult[];
  finalBankroll: number;
  peakBankroll: number;
  peakBet: number;
  totalRounds: number;
  wentBankrupt: boolean;
  reachedTarget: boolean;
  totalWins: number;
  totalLosses: number;
  maxConsecutiveLosses: number;
  netProfit: number;
}

/** Toplu simülasyon yapılandırması */
export interface BulkConfig {
  numPlayers: number;
  sessionConfig: SessionConfig;
}

/** Toplu simülasyon sonucu */
export interface BulkResult {
  numPlayers: number;
  bankruptCount: number;
  targetReachedCount: number;
  averageFinalBankroll: number;
  medianFinalBankroll: number;
  averageRounds: number;
  finalBankrolls: number[];  // histogram için
  bankruptRate: number;
}

/** Oturum fazları */
export type SessionPhase =
  | 'setup'
  | 'running'
  | 'paused'
  | 'bankrupt'
  | 'target_reached'
  | 'max_rounds';
