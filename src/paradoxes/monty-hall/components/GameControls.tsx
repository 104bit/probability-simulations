/* ============================================================
   GameControls — Strategy, Door Count, Trial Settings
   ============================================================ */

import React from 'react';
import type { Strategy } from '../types';

interface GameControlsProps {
  numDoors: number;
  onNumDoorsChange: (n: number) => void;
  strategy: Strategy;
  onStrategyChange: (s: Strategy) => void;
  disabled?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  numDoors,
  onNumDoorsChange,
  strategy,
  onStrategyChange,
  disabled = false,
}) => {
  return (
    <div style={styles.container} className="glass">
      {/* Door count slider */}
      <div style={styles.controlGroup}>
        <label style={styles.label}>
          <span style={styles.labelIcon}>🚪</span>
          Kapı Sayısı
        </label>
        <div style={styles.sliderRow}>
          <input
            type="range"
            min={3}
            max={10}
            value={numDoors}
            onChange={(e) => onNumDoorsChange(Number(e.target.value))}
            disabled={disabled}
            style={styles.slider}
          />
          <span style={styles.sliderValue}>{numDoors}</span>
        </div>
      </div>

      {/* Strategy selection */}
      <div style={styles.controlGroup}>
        <label style={styles.label}>
          <span style={styles.labelIcon}>🎯</span>
          Strateji
        </label>
        <div style={styles.strategyButtons}>
          <button
            className={`btn ${strategy === 'stay' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onStrategyChange('stay')}
            disabled={disabled}
            style={styles.strategyBtn}
          >
            <span>🏠</span> Kalma
          </button>
          <button
            className={`btn ${strategy === 'switch' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onStrategyChange('switch')}
            disabled={disabled}
            style={styles.strategyBtn}
          >
            <span>🔄</span> Değiştirme
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--space-6)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-8)',
    alignItems: 'flex-start',
  },
  controlGroup: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  label: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  labelIcon: {
    fontSize: 'var(--font-size-base)',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  slider: {
    flex: 1,
    height: 6,
    appearance: 'none' as const,
    background: 'linear-gradient(90deg, var(--color-accent-dark), var(--color-accent-light))',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
    accentColor: 'var(--color-accent)',
  },
  sliderValue: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 800,
    color: 'var(--color-accent-light)',
    minWidth: '40px',
    textAlign: 'center' as const,
  },
  strategyButtons: {
    display: 'flex',
    gap: 'var(--space-3)',
  },
  strategyBtn: {
    flex: 1,
    padding: 'var(--space-3) var(--space-4)',
  },
};

export default GameControls;
