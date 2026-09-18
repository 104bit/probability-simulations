/* ============================================================
   Monty Hall — Pure Simulation Engine
   ============================================================
   No React dependencies. Pure functions, fully testable.
   ============================================================ */

import type { GameConfig, GameResult, BulkConfig, BulkResult, Strategy, DoorInfo, StrategyResult } from './types';

/**
 * Rastgele tam sayı üretir [0, max) aralığında.
 */
function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Diziden rastgele bir eleman seçer.
 */
function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

/**
 * Teorik kazanma olasılığını hesaplar.
 *
 * N kapılı Monty Hall probleminde sunucu 1 kapı açar:
 * - Stay:   P(win) = 1/N
 * - Switch: P(win) = (N-1) / (N × (N-2))
 *
 * Açıklama: Oyuncu 1/N olasılıkla doğru kapıyı seçer.
 * Değiştirirse, kalan (N-2) kapıdan birini seçer.
 * Yanlış seçmiş olma olasılığı (N-1)/N, doğru kapının
 * kalan (N-2) kapıdan biri olma olasılığı 1/(N-2).
 * Toplam: (N-1) / (N × (N-2))
 */
export function calculateTheoreticalProbability(numDoors: number, strategy: Strategy): number {
  if (numDoors < 3) throw new Error('En az 3 kapı gereklidir');
  
  if (strategy === 'stay') {
    return 1 / numDoors;
  }
  // switch
  return (numDoors - 1) / (numDoors * (numDoors - 2));
}

/**
 * Tek bir Monty Hall oyununu simüle eder.
 *
 * Kurallar:
 * 1. Arabanın yeri rastgele belirlenir (veya prizeDoor ile sabitlenir)
 * 2. Oyuncu bir kapı seçer (veya playerChoice ile sabitlenir)
 * 3. Sunucu, oyuncunun seçmediği VE araba olmayan bir kapıyı açar
 * 4. Strateji uygulanır: kalma veya değiştirme
 * 5. Sonuç belirlenir
 */
export function simulateGame(config: GameConfig): GameResult {
  const { numDoors, strategy } = config;

  if (numDoors < 3) throw new Error('En az 3 kapı gereklidir');

  // 1. Araba yerleştir
  const prizeDoor = config.prizeDoor ?? randomInt(numDoors);
  
  // 2. Oyuncu seçimi
  const playerInitialChoice = config.playerChoice ?? randomInt(numDoors);

  // 3. Sunucu açılabilecek kapıları belirle
  const revealable: number[] = [];
  for (let i = 0; i < numDoors; i++) {
    if (i !== playerInitialChoice && i !== prizeDoor) {
      revealable.push(i);
    }
  }
  const revealedDoor = randomChoice(revealable);

  // 4. Strateji uygula
  let playerFinalChoice: number;
  if (strategy === 'stay') {
    playerFinalChoice = playerInitialChoice;
  } else {
    // Değiştir: Seçili ve açılan kapı haricindeki kapılardan birini seç
    const switchOptions: number[] = [];
    for (let i = 0; i < numDoors; i++) {
      if (i !== playerInitialChoice && i !== revealedDoor) {
        switchOptions.push(i);
      }
    }
    playerFinalChoice = randomChoice(switchOptions);
  }

  // 5. Sonuç
  const won = playerFinalChoice === prizeDoor;

  // 6. Kapı durumlarını oluştur
  const doors: DoorInfo[] = [];
  for (let i = 0; i < numDoors; i++) {
    const hasPrize = i === prizeDoor;
    let state: DoorInfo['state'];

    if (i === revealedDoor) {
      state = 'revealed';
    } else if (i === playerFinalChoice) {
      state = won ? 'won' : 'lost';
    } else if (i === playerInitialChoice && strategy === 'switch') {
      state = 'unselected';
    } else {
      state = 'closed';
    }

    doors.push({ index: i, hasPrize, state });
  }

  return {
    numDoors,
    strategy,
    prizeDoor,
    playerInitialChoice,
    revealedDoor,
    playerFinalChoice,
    won,
    doors,
  };
}

/**
 * Toplu simülasyon çalıştırır.
 * Her iki strateji için de ayrı ayrı simüle eder.
 */
export function runBulkSimulation(config: BulkConfig): BulkResult {
  const { numDoors, numTrials } = config;

  const runForStrategy = (strategy: Strategy): StrategyResult => {
    let wins = 0;
    for (let i = 0; i < numTrials; i++) {
      const result = simulateGame({ numDoors, strategy });
      if (result.won) wins++;
    }
    const losses = numTrials - wins;
    const winRate = wins / numTrials;
    const theoreticalRate = calculateTheoreticalProbability(numDoors, strategy);

    return { strategy, wins, losses, total: numTrials, winRate, theoreticalRate };
  };

  return {
    numDoors,
    numTrials,
    stay: runForStrategy('stay'),
    switch: runForStrategy('switch'),
  };
}
