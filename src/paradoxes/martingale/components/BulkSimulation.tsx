/* ============================================================
   BulkSimulation — Mass Martingale Simulation
   ============================================================ */

import React, { useState, useCallback } from 'react';
import { Users, Play, Skull, Target, Coins, Clock, Lightbulb } from 'lucide-react';
import { runBulkMartingale } from '../simulation';
import type { BulkResult, SessionConfig } from '../types';
import { useSound } from '../../../hooks/useSound';

interface BulkSimulationProps {
  sessionConfig: SessionConfig;
}

const PLAYER_PRESETS = [100, 500, 1_000, 5_000];

const BulkSimulation: React.FC<BulkSimulationProps> = ({ sessionConfig }) => {
  const [numPlayers, setNumPlayers] = useState(1000);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { playClick, playPop } = useSound();

  const run = useCallback(() => {
    playClick();
    setIsRunning(true);
    setTimeout(() => {
      const res = runBulkMartingale({ numPlayers, sessionConfig });
      setResult(res);
      setIsRunning(false);
      playPop();
    }, 50);
  }, [numPlayers, sessionConfig, playClick, playPop]);

  return (
    <div style={styles.wrapper}>
      {/* Controls */}
      <div style={styles.controls} className="glass">
        <div style={styles.controlGroup}>
          <label style={styles.label}><Users size={16} /> Oyuncu Sayısı</label>
          <div style={styles.presets}>
            {PLAYER_PRESETS.map(n => (
              <button
                key={n}
                className={`btn ${numPlayers === n ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setNumPlayers(n)}
                disabled={isRunning}
                style={numPlayers === n ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' } : undefined}
              >
                {n.toLocaleString('tr-TR')}
              </button>
            ))}
          </div>
        </div>
        <button
          className="btn btn-lg"
          style={styles.runBtn}
          onClick={run}
          disabled={isRunning}
        >
          {isRunning ? (
            '⏳ Çalışıyor...'
          ) : (
            <>
              <Play size={18} fill="currentColor" /> Simülasyonu Başlat
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-slide-up">
          {/* Big stat cards */}
          <div style={styles.bigStats}>
            <div style={{ ...styles.bigCard, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <div style={styles.bigCardIcon}><Skull size={32} color="var(--color-error)" /></div>
              <div style={styles.bigCardLabel}>İflas Oranı</div>
              <div style={{ ...styles.bigCardValue, color: 'var(--color-error)' }}>
                %{(result.bankruptRate * 100).toFixed(1)}
              </div>
              <div style={styles.bigCardSub}>
                {result.bankruptCount} / {result.numPlayers} oyuncu
              </div>
            </div>
            <div style={{ ...styles.bigCard, borderColor: 'rgba(34, 197, 94, 0.3)' }}>
              <div style={styles.bigCardIcon}><Target size={32} color="var(--color-success)" /></div>
              <div style={styles.bigCardLabel}>Hedefe Ulaşan</div>
              <div style={{ ...styles.bigCardValue, color: 'var(--color-success)' }}>
                %{(result.targetReachedCount / result.numPlayers * 100).toFixed(1)}
              </div>
              <div style={styles.bigCardSub}>
                {result.targetReachedCount} / {result.numPlayers} oyuncu
              </div>
            </div>
            <div style={{ ...styles.bigCard, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <div style={styles.bigCardIcon}><Coins size={32} color="#f59e0b" /></div>
              <div style={styles.bigCardLabel}>Ort. Son Bakiye</div>
              <div style={{ ...styles.bigCardValue, color: result.averageFinalBankroll >= sessionConfig.initialBankroll ? 'var(--color-success)' : 'var(--color-error)' }}>
                {result.averageFinalBankroll.toFixed(0)}₺
              </div>
              <div style={styles.bigCardSub}>
                Medyan: {result.medianFinalBankroll.toFixed(0)}₺
              </div>
            </div>
            <div style={{ ...styles.bigCard, borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <div style={styles.bigCardIcon}><Clock size={32} color="var(--color-accent-light)" /></div>
              <div style={styles.bigCardLabel}>Ort. Tur Sayısı</div>
              <div style={styles.bigCardValue}>
                {result.averageRounds.toFixed(0)}
              </div>
              <div style={styles.bigCardSub}>
                Maks: {sessionConfig.maxRounds}
              </div>
            </div>
          </div>

          {/* Histogram */}
          <div style={styles.chartCard} className="glass">
            <h3 style={styles.chartTitle}>Son Bakiye Dağılımı</h3>
            <DistributionChart bankrolls={result.finalBankrolls} initialBankroll={sessionConfig.initialBankroll} />
          </div>

          {/* Insight */}
          <div style={styles.insight} className="glass">
            <div style={styles.insightIcon}><Lightbulb size={32} color="#f59e0b" /></div>
            <div>
              <strong style={{ color: '#f59e0b' }}>
                {result.numPlayers.toLocaleString('tr-TR')} kişi Martingale oynasa...
              </strong>
              <p style={styles.insightText}>
                <strong style={{ color: 'var(--color-error)' }}>{result.bankruptCount}</strong> kişi iflas eder
                ({(result.bankruptRate * 100).toFixed(1)}%).
                {result.targetReachedCount > 0 && (
                  <> <strong style={{ color: 'var(--color-success)' }}>{result.targetReachedCount}</strong> kişi hedefe ulaşır.</>
                )}
                {' '}Ortalama son bakiye <strong>{result.averageFinalBankroll.toFixed(0)}₺</strong>
                {result.averageFinalBankroll < sessionConfig.initialBankroll
                  ? ' — yani ortalamada para kaybedilir!'
                  : ' — ama medyan bakiyeye bakın: çoğu kişi zarar eder, az sayıda şanslı kişi ortalamayı yükseltir.'
                }
              </p>
              <p style={styles.insightText}>
                Martingale <strong>"yüksek olasılıkla küçük kazanç, düşük olasılıkla büyük kayıp"</strong> üretir.
                Bu asimetri, stratejinin uzun vadede işe yaramamasının nedenidir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   Distribution Histogram
   ============================================================ */

const DistributionChart: React.FC<{ bankrolls: number[], initialBankroll: number }> = ({ bankrolls, initialBankroll }) => {
  const W = 700, H = 180;
  const PAD = { top: 10, right: 20, bottom: 30, left: 50 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;

  // Create bins
  const min = Math.min(...bankrolls);
  const max = Math.max(...bankrolls);
  const numBins = 30;
  const binSize = (max - min) / numBins || 1;

  const bins = Array.from({ length: numBins }, (_, i) => {
    const lo = min + i * binSize;
    const hi = lo + binSize;
    const count = bankrolls.filter(b => b >= lo && (i === numBins - 1 ? b <= hi : b < hi)).length;
    return { lo, hi, count };
  });

  const maxCount = Math.max(...bins.map(b => b.count), 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {bins.map((bin, i) => {
        const x = PAD.left + (i / numBins) * IW;
        const barW = IW / numBins - 1;
        const barH = (bin.count / maxCount) * IH;
        const isLoss = bin.hi < initialBankroll;
        const isBankrupt = bin.hi <= 0;
        return (
          <rect
            key={i}
            x={x} y={PAD.top + IH - barH}
            width={Math.max(barW, 1)} height={barH}
            rx={1}
            fill={isBankrupt ? '#ef4444' : isLoss ? '#f97316' : '#22c55e'}
            opacity={0.7}
          >
            <title>{bin.lo.toFixed(0)}₺–{bin.hi.toFixed(0)}₺: {bin.count} kişi</title>
          </rect>
        );
      })}

      {/* Initial bankroll line */}
      {min < initialBankroll && max > initialBankroll && (
        <>
          <line
            x1={PAD.left + ((initialBankroll - min) / (max - min)) * IW}
            y1={PAD.top}
            x2={PAD.left + ((initialBankroll - min) / (max - min)) * IW}
            y2={H - PAD.bottom}
            stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2"
          />
          <text
            x={PAD.left + ((initialBankroll - min) / (max - min)) * IW}
            y={PAD.top - 2}
            textAnchor="middle" fontSize="8" fill="#f59e0b" fontFamily="Inter, sans-serif"
          >
            Başlangıç
          </text>
        </>
      )}

      {/* X labels */}
      <text x={PAD.left} y={H - 8} fontSize="9" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif">
        {min.toFixed(0)}₺
      </text>
      <text x={W - PAD.right} y={H - 8} textAnchor="end" fontSize="9" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif">
        {max.toFixed(0)}₺
      </text>
      <text x={PAD.left + IW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif">
        Son bakiye
      </text>
    </svg>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)',
  },
  controls: {
    padding: 'var(--space-6)',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 'var(--space-6)',
    alignItems: 'flex-end',
  },
  controlGroup: {
    flex: 1,
    minWidth: 200,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  label: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  presets: {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap' as const,
  },
  runBtn: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
    border: 'none',
    minWidth: 200,
  },
  bigStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
  },
  bigCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-5)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid',
    backdropFilter: 'blur(8px)',
  },
  bigCardIcon: {
    fontSize: 'var(--font-size-2xl)',
  },
  bigCardLabel: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  bigCardValue: {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 800,
    color: 'var(--color-text)',
  },
  bigCardSub: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  chartCard: {
    padding: 'var(--space-6)',
    marginBottom: 'var(--space-4)',
  },
  chartTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    marginBottom: 'var(--space-3)',
  },
  insight: {
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    gap: 'var(--space-4)',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 'var(--font-size-2xl)',
    lineHeight: 1,
  },
  insightText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
    marginTop: 'var(--space-1)',
  },
};

export default BulkSimulation;
