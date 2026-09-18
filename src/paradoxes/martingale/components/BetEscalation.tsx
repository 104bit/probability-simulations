/* ============================================================
   BetEscalation — Visual of Exponential Bet Growth
   ============================================================ */

import React from 'react';
import { betAfterStreak, totalLossAfterStreak, streakProbability } from '../simulation';

interface BetEscalationProps {
  baseBet: number;
  currentStreak: number;
  currentBet: number;
  bankroll: number;
  winProbability: number;
}

const BetEscalation: React.FC<BetEscalationProps> = ({
  baseBet,
  currentStreak,
  currentBet,
  bankroll,
  winProbability,
}) => {
  // Kaç tur daha kaybedebilir?
  let roundsUntilBankrupt = 0;
  let testBet = currentBet;
  let testBankroll = bankroll;
  while (testBankroll >= testBet && roundsUntilBankrupt < 20) {
    testBankroll -= testBet;
    testBet *= 2;
    roundsUntilBankrupt++;
  }

  const totalLoss = totalLossAfterStreak(baseBet, currentStreak);
  const nextBet = betAfterStreak(baseBet, currentStreak);
  const streakProb = streakProbability(winProbability, currentStreak);

  // Streak görseli — her kutu 2x büyür
  const maxBoxes = Math.min(currentStreak + 3, 12);
  const boxes = Array.from({ length: maxBoxes }, (_, i) => ({
    streak: i,
    bet: betAfterStreak(baseBet, i),
    isActive: i < currentStreak,
    isCurrent: i === currentStreak,
    isFuture: i > currentStreak,
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>📊</span>
        <span style={styles.headerText}>Bahis Büyümesi</span>
      </div>

      {/* Streak visualization */}
      <div style={styles.streakRow}>
        {boxes.map(box => {
          const size = Math.min(16 + box.streak * 5, 60);
          return (
            <div key={box.streak} style={styles.boxWrapper}>
              <div style={{
                width: size,
                height: size,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size < 28 ? 7 : 9,
                fontWeight: 700,
                transition: 'all 300ms ease',
                ...(box.isActive ? {
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                } : box.isCurrent ? {
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                } : {
                  background: 'var(--color-surface-active)',
                  color: 'var(--color-text-muted)',
                  border: '1px dashed var(--color-border)',
                }),
              }}>
                {box.bet}₺
              </div>
              {box.isActive && (
                <span style={styles.lossLabel}>−{box.bet}₺</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Üst Üste Kayıp</div>
          <div style={{
            ...styles.statValue,
            color: currentStreak >= 4 ? 'var(--color-error)' : currentStreak >= 2 ? '#f59e0b' : 'var(--color-text)',
          }}>
            {currentStreak}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Toplam Kayıp</div>
          <div style={{ ...styles.statValue, color: 'var(--color-error)' }}>
            {totalLoss > 0 ? `-${totalLoss}₺` : '0₺'}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Şimdiki Bahis</div>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>
            {nextBet}₺
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Kazanırsa Kâr</div>
          <div style={{ ...styles.statValue, color: 'var(--color-success)' }}>
            +{baseBet}₺
          </div>
        </div>
      </div>

      {/* Warning */}
      {currentStreak >= 2 && (
        <div style={{
          ...styles.warning,
          borderColor: currentStreak >= 5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)',
          background: currentStreak >= 5 ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)',
        }}>
          <span style={styles.warningText}>
            ⚠️ <strong>{nextBet}₺</strong> riske atarak sadece <strong>{baseBet}₺</strong> kazanmaya çalışıyorsunuz.
            {roundsUntilBankrupt <= 3 && (
              <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>
                {' '}Sadece {roundsUntilBankrupt} kayıp daha iflas!
              </span>
            )}
          </span>
          <span style={styles.warningProb}>
            Bu seri olasılığı: %{(streakProb * 100).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-3)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  headerText: {
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  streakRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--space-1)',
    flexWrap: 'wrap' as const,
    padding: 'var(--space-2) 0',
  },
  boxWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 2,
  },
  lossLabel: {
    fontSize: 8,
    color: 'var(--color-error)',
    fontWeight: 600,
  },
  statsRow: {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap' as const,
  },
  statCard: {
    flex: 1,
    minWidth: 70,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 2,
    padding: 'var(--space-2)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  statLabel: {
    fontSize: 8,
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
  },
  warning: {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  warningText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  },
  warningProb: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
};

export default BetEscalation;
