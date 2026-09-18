/* ============================================================
   Martingale Betting Paradox — Pure Simulation Engine
   ============================================================
   No React dependencies. Pure functions, fully testable.
   ============================================================ */

import type { RoundResult, SessionConfig, SessionResult, BulkConfig, BulkResult } from './types';

/**
 * Tek bir tur simüle eder.
 */
export function simulateRound(
  round: number,
  currentBet: number,
  bankroll: number,
  winProbability: number,
  consecutiveLosses: number,
  baseBet: number,
): RoundResult {
  const won = Math.random() < winProbability;
  const payout = won ? currentBet : -currentBet;
  const newBankroll = bankroll + payout;

  return {
    round,
    bet: currentBet,
    won,
    payout,
    bankroll: newBankroll,
    consecutiveLosses: won ? 0 : consecutiveLosses + 1,
  };
}

/**
 * Tam bir oturum simüle eder.
 * Martingale stratejisi: kaybettiğinde bahsi ikiye katla, kazandığında başlangıca dön.
 */
export function simulateSession(config: SessionConfig): SessionResult {
  const { initialBankroll, baseBet, winProbability, maxRounds, targetProfit } = config;

  const rounds: RoundResult[] = [];
  let bankroll = initialBankroll;
  let currentBet = baseBet;
  let consecutiveLosses = 0;
  let peakBankroll = initialBankroll;
  let peakBet = baseBet;
  let totalWins = 0;
  let totalLosses = 0;
  let maxConsecutiveLosses = 0;
  let wentBankrupt = false;
  let reachedTarget = false;

  for (let r = 0; r < maxRounds; r++) {
    // Bahis bakiyeyi aşıyorsa, kalan bakiyeyi koy
    const actualBet = Math.min(currentBet, bankroll);
    if (actualBet <= 0) {
      wentBankrupt = true;
      break;
    }

    const result = simulateRound(r, actualBet, bankroll, winProbability, consecutiveLosses, baseBet);
    rounds.push(result);

    bankroll = result.bankroll;
    consecutiveLosses = result.consecutiveLosses;

    if (result.won) {
      totalWins++;
      currentBet = baseBet; // Kazandıysa başlangıca dön
    } else {
      totalLosses++;
      currentBet = actualBet * 2; // Kaybettiyse ikiye katla
    }

    if (consecutiveLosses > maxConsecutiveLosses) {
      maxConsecutiveLosses = consecutiveLosses;
    }
    if (bankroll > peakBankroll) peakBankroll = bankroll;
    if (currentBet > peakBet) peakBet = currentBet;

    // İflas kontrolü
    if (bankroll <= 0) {
      wentBankrupt = true;
      break;
    }

    // Hedefe ulaşma kontrolü
    if (targetProfit !== null && bankroll >= initialBankroll + targetProfit) {
      reachedTarget = true;
      break;
    }
  }

  return {
    rounds,
    finalBankroll: bankroll,
    peakBankroll,
    peakBet,
    totalRounds: rounds.length,
    wentBankrupt,
    reachedTarget,
    totalWins,
    totalLosses,
    maxConsecutiveLosses,
    netProfit: bankroll - initialBankroll,
  };
}

/**
 * Toplu simülasyon — N oyuncu aynı stratejiyle oynuyor.
 */
export function runBulkMartingale(config: BulkConfig): BulkResult {
  const { numPlayers, sessionConfig } = config;
  const finalBankrolls: number[] = [];
  let bankruptCount = 0;
  let targetReachedCount = 0;
  let totalRoundsSum = 0;

  for (let i = 0; i < numPlayers; i++) {
    const result = simulateSession(sessionConfig);
    finalBankrolls.push(result.finalBankroll);
    if (result.wentBankrupt) bankruptCount++;
    if (result.reachedTarget) targetReachedCount++;
    totalRoundsSum += result.totalRounds;
  }

  // Medyan hesapla
  const sorted = [...finalBankrolls].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  return {
    numPlayers,
    bankruptCount,
    targetReachedCount,
    averageFinalBankroll: finalBankrolls.reduce((a, b) => a + b, 0) / numPlayers,
    medianFinalBankroll: median,
    averageRounds: totalRoundsSum / numPlayers,
    finalBankrolls,
    bankruptRate: bankruptCount / numPlayers,
  };
}

/**
 * N üst üste kayıp sonrası toplam kayıp hesabı.
 */
export function totalLossAfterStreak(baseBet: number, streak: number): number {
  return baseBet * (Math.pow(2, streak) - 1);
}

/**
 * N üst üste kayıp sonrası gerekli bahis.
 */
export function betAfterStreak(baseBet: number, streak: number): number {
  return baseBet * Math.pow(2, streak);
}

/**
 * N üst üste kayıp olasılığı.
 */
export function streakProbability(winProb: number, streak: number): number {
  return Math.pow(1 - winProb, streak);
}
