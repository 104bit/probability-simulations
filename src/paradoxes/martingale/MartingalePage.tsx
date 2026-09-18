/* ============================================================
   MartingalePage — Main Page for Martingale Betting Paradox
   ============================================================ */

import React, { useState } from 'react';
import { 
  Gamepad2, BarChart2, Settings, Coins, 
  Dice5, RotateCcw, Target, CircleDollarSign
} from 'lucide-react';
import SingleSession from './components/SingleSession';
import BulkSimulation from './components/BulkSimulation';
import type { SessionConfig } from './types';

type Mode = 'single' | 'bulk';

const MartingalePage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('single');
  const [initialBankroll, setInitialBankroll] = useState(100);
  const [baseBet, setBaseBet] = useState(1);
  const [winProbability, setWinProbability] = useState(0.5);
  const [maxRounds, setMaxRounds] = useState(200);
  const [targetProfit, setTargetProfit] = useState<number>(20);

  const config: SessionConfig = {
    initialBankroll,
    baseBet,
    winProbability,
    maxRounds,
    targetProfit,
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.badge}>Bahis Paradoksu</div>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>
              <CircleDollarSign size={40} />
            </span>
            Martingale Stratejisi
          </h1>
          <p style={styles.description}>
            "Kaybettikçe bahsi ikiye katla, eninde sonunda kazanırsın."
            Kulağa mantıklı geliyor — ama bu strateji neden çalışmaz?
          </p>
        </div>
      </header>

      {/* Mode toggle */}
      <div style={styles.modeToggle}>
        <button
          className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('single')}
          style={{ ...mode === 'single' ? styles.activeBtn : {}, gap: 'var(--space-2)' }}
        >
          <Gamepad2 size={18} /> Tek Oturum
        </button>
        <button
          className={`btn ${mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('bulk')}
          style={{ ...mode === 'bulk' ? styles.activeBtn : {}, gap: 'var(--space-2)' }}
        >
          <BarChart2 size={18} /> Toplu Simülasyon
        </button>
      </div>

      {/* Settings */}
      <div className="glass" style={styles.settings}>
        <div style={styles.settingsTitle}>
          <Settings size={16} /> Parametreler
        </div>
        <div style={styles.settingsGrid}>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>
              <Coins size={14} style={{ color: '#f59e0b' }} /> Başlangıç Bakiyesi
            </label>
            <div style={styles.sliderRow}>
              <input type="range" min={50} max={1000} step={50}
                value={initialBankroll}
                onChange={(e) => setInitialBankroll(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderVal}>{initialBankroll}₺</span>
            </div>
          </div>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>
              <CircleDollarSign size={14} style={{ color: '#f59e0b' }} /> Bahis Birimi
            </label>
            <div style={styles.sliderRow}>
              <input type="range" min={1} max={20} step={1}
                value={baseBet}
                onChange={(e) => setBaseBet(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderVal}>{baseBet}₺</span>
            </div>
          </div>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>
              <Dice5 size={14} style={{ color: '#f59e0b' }} /> Kazanma Olasılığı
            </label>
            <div style={styles.sliderRow}>
              <input type="range" min={40} max={50} step={1}
                value={Math.round(winProbability * 100)}
                onChange={(e) => setWinProbability(Number(e.target.value) / 100)}
                style={styles.slider}
              />
              <span style={styles.sliderVal}>%{(winProbability * 100).toFixed(0)}</span>
            </div>
            <span style={styles.settingHint}>
              {winProbability === 0.5 ? 'Adil oyun' : `Kasa avantajı: %${((0.5 - winProbability) * 100).toFixed(0)}`}
            </span>
          </div>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>
              <RotateCcw size={14} style={{ color: '#f59e0b' }} /> Maks Tur
            </label>
            <div style={styles.sliderRow}>
              <input type="range" min={50} max={1000} step={50}
                value={maxRounds}
                onChange={(e) => setMaxRounds(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderVal}>{maxRounds}</span>
            </div>
          </div>
          <div style={styles.settingItem}>
            <label style={styles.settingLabel}>
              <Target size={14} style={{ color: '#f59e0b' }} /> Hedef Kâr
            </label>
            <div style={styles.sliderRow}>
              <input type="range" min={5} max={200} step={5}
                value={targetProfit}
                onChange={(e) => setTargetProfit(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderVal}>+{targetProfit}₺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {mode === 'single' ? (
        <SingleSession key={`${initialBankroll}-${baseBet}-${winProbability}-${maxRounds}-${targetProfit}`} config={config} />
      ) : (
        <BulkSimulation key={`bulk-${initialBankroll}-${baseBet}-${winProbability}`} sessionConfig={config} />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-8)',
    padding: 'var(--space-8) var(--space-6)',
    maxWidth: 1100,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center' as const,
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  badge: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
    padding: 'var(--space-1) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  title: {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: 800,
    color: 'var(--color-text)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    letterSpacing: '-0.02em',
  },
  titleIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f59e0b',
  },
  description: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-muted)',
    maxWidth: 600,
    lineHeight: 1.7,
    fontStyle: 'italic',
  },
  modeToggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-3)',
  },
  activeBtn: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
  },
  settings: {
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  settingsTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-5)',
  },
  settingItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-1)',
  },
  settingLabel: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  slider: {
    flex: 1,
    height: 4,
    appearance: 'none' as const,
    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
  },
  sliderVal: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 800,
    color: '#f59e0b',
    minWidth: 50,
    textAlign: 'right' as const,
  },
  settingHint: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
};

export default MartingalePage;
