/* ============================================================
   Birthday Paradox — Pure Simulation Engine
   ============================================================
   No React dependencies. Pure functions, fully testable.
   ============================================================ */

import type { Person, StepResult, TrialResult, BulkConfig, BulkResult, GroupSizeResult } from './types';
import { MONTH_NAMES, DAYS_IN_MONTH } from './types';

/**
 * Gün indeksinden (0-364) ay ve gün bilgisini hesaplar.
 */
export function dayIndexToDate(dayIndex: number): { month: number; day: number; label: string } {
  let remaining = dayIndex;
  for (let m = 0; m < 12; m++) {
    if (remaining < DAYS_IN_MONTH[m]) {
      return {
        month: m,
        day: remaining + 1,
        label: `${remaining + 1} ${MONTH_NAMES[m]}`,
      };
    }
    remaining -= DAYS_IN_MONTH[m];
  }
  // Fallback (shouldn't happen with valid 0-364)
  return { month: 11, day: 31, label: '31 Ara' };
}

/**
 * Rastgele doğum günü üretir (0-364).
 */
function randomBirthday(): number {
  return Math.floor(Math.random() * 365);
}

/**
 * Person nesnesi oluşturur.
 */
export function createPerson(id: number, birthday?: number): Person {
  const bday = birthday ?? randomBirthday();
  const { month, day, label } = dayIndexToDate(bday);
  return { id, birthday: bday, month, day, label, isMatch: false };
}

/**
 * Teorik olasılık hesaplama.
 * 
 * P(N) = 1 - (365/365) × (364/365) × ... × ((365-N+1)/365)
 * 
 * N kişilik grupta en az iki kişinin aynı doğum gününe sahip olma olasılığı.
 */
export function calculateBirthdayProbability(n: number): number {
  if (n <= 1) return 0;
  if (n >= 365) return 1;

  let pNoMatch = 1;
  for (let i = 0; i < n; i++) {
    pNoMatch *= (365 - i) / 365;
  }
  return 1 - pNoMatch;
}

/**
 * Belirli bir olasılık eşiğini geçen minimum kişi sayısını bulur.
 */
export function findThresholdN(targetProbability: number): number {
  for (let n = 2; n <= 365; n++) {
    if (calculateBirthdayProbability(n) >= targetProbability) {
      return n;
    }
  }
  return 365;
}

/**
 * Tek adım simülasyonu — yeni bir kişi eklenir.
 * Mevcut doğum günleri listesiyle çakışma kontrolü yapar.
 */
export function simulateBirthdayStep(
  existingPeople: Person[],
  newPersonId: number,
): StepResult {
  const person = createPerson(newPersonId);
  const allBirthdays = existingPeople.map(p => p.birthday);

  // Eşleşme kontrolü
  const matchIndex = allBirthdays.indexOf(person.birthday);
  const matchFound = matchIndex !== -1;

  if (matchFound) {
    person.isMatch = true;
  }

  return {
    person,
    matchFound,
    matchWith: matchFound ? existingPeople[matchIndex].id : null,
    totalPeople: existingPeople.length + 1,
    allBirthdays: [...allBirthdays, person.birthday],
  };
}

/**
 * Tam bir deneyi simüle eder — N kişilik grup.
 */
export function simulateBirthdayTrial(groupSize: number): TrialResult {
  const people: Person[] = [];
  const birthdaySet = new Set<number>();

  for (let i = 0; i < groupSize; i++) {
    const person = createPerson(i);

    if (birthdaySet.has(person.birthday)) {
      // Eşleşme bulundu
      person.isMatch = true;
      const matchWith = people.find(p => p.birthday === person.birthday)!;
      matchWith.isMatch = true;
      people.push(person);

      return {
        groupSize,
        people,
        matchFound: true,
        matchDay: person.birthday,
        matchAtStep: i + 1,
        matchPair: [matchWith.id, person.id],
      };
    }

    birthdaySet.add(person.birthday);
    people.push(person);
  }

  return {
    groupSize,
    people,
    matchFound: false,
    matchDay: null,
    matchAtStep: null,
    matchPair: null,
  };
}

/**
 * Toplu simülasyon — her grup boyutu için N deney çalıştırır.
 * 2'den maxGroupSize'a kadar her boyutu test eder.
 */
export function runBulkBirthdaySimulation(config: BulkConfig): BulkResult {
  const { maxGroupSize, numTrials } = config;
  const results: GroupSizeResult[] = [];

  for (let size = 2; size <= maxGroupSize; size++) {
    let matches = 0;
    for (let t = 0; t < numTrials; t++) {
      const result = simulateBirthdayTrial(size);
      if (result.matchFound) matches++;
    }

    results.push({
      groupSize: size,
      matches,
      total: numTrials,
      matchRate: matches / numTrials,
      theoreticalRate: calculateBirthdayProbability(size),
    });
  }

  return { numTrials, results };
}
