/* ============================================================
   RouletteWheel — Coin Flip SVG Visual
   ============================================================ */

import React from 'react';

interface RouletteWheelProps {
  lastResult: boolean | null; // true = win, false = loss, null = not yet
  isFlipping?: boolean;
  history: boolean[]; // son sonuçlar
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({ lastResult, isFlipping = false, history }) => {
  return (
    <div style={styles.container}>
      {/* Main coin */}
      <div style={{
        ...styles.coinWrapper,
        animation: isFlipping ? 'celebrate 400ms ease-out' : 'none',
      }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          <defs>
            <radialGradient id="coin-grad" cx="40%" cy="35%">
              <stop offset="0%" stopColor={lastResult === null ? '#64748b' : lastResult ? '#22c55e' : '#ef4444'} />
              <stop offset="100%" stopColor={lastResult === null ? '#334155' : lastResult ? '#15803d' : '#991b1b'} />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="36" fill="url(#coin-grad)"
            stroke={lastResult === null ? '#475569' : lastResult ? '#4ade80' : '#f87171'}
            strokeWidth="3"
          />
          <text x="40" y="45" textAnchor="middle" fontSize="28" fontWeight="bold"
            fill="white" fontFamily="Inter, sans-serif"
          >
            {lastResult === null ? '?' : lastResult ? 'W' : 'L'}
          </text>
        </svg>
      </div>

      {/* Result text */}
      {lastResult !== null && (
        <div style={{
          ...styles.resultText,
          color: lastResult ? 'var(--color-success)' : 'var(--color-error)',
        }}>
          {lastResult ? '✅ Kazandı' : '❌ Kaybetti'}
        </div>
      )}

      {/* History dots */}
      {history.length > 0 && (
        <div style={styles.history}>
          {history.slice(-20).map((won, i) => (
            <div
              key={i}
              style={{
                ...styles.historyDot,
                background: won ? 'var(--color-success)' : 'var(--color-error)',
                opacity: 0.5 + (i / history.slice(-20).length) * 0.5,
              }}
              title={`Tur ${history.length - history.slice(-20).length + i + 1}: ${won ? 'Kazanç' : 'Kayıp'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  coinWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
  },
  history: {
    display: 'flex',
    gap: 3,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    maxWidth: 200,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 200ms ease',
  },
};

export default RouletteWheel;
