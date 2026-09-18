/* ============================================================
   BulkSimulation — Mass Trial Simulation with Results Chart
   ============================================================ */

import React, { useState, useCallback } from 'react';
import { Hash, Ruler, Home, RefreshCw, Lightbulb, Play, Loader2 } from 'lucide-react';
import { runBulkSimulation, calculateTheoreticalProbability } from '../simulation';
import type { BulkResult } from '../types';
import { useSound } from '../../../hooks/useSound';

interface BulkSimulationProps {
  numDoors: number;
}

const TRIAL_PRESETS = [100, 1_000, 10_000, 50_000];

const BulkSimulation: React.FC<BulkSimulationProps> = ({ numDoors }) => {
  const { playClick, playSuccess } = useSound();
  const [numTrials, setNumTrials] = useState(1000);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = useCallback(() => {
    playClick();
    setIsRunning(true);
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const res = runBulkSimulation({ numDoors, numTrials });
      setResult(res);
      setIsRunning(false);
      playSuccess();
    }, 50);
  }, [numDoors, numTrials, playClick, playSuccess]);

  const theoreticalStay = calculateTheoreticalProbability(numDoors, 'stay');
  const theoreticalSwitch = calculateTheoreticalProbability(numDoors, 'switch');

  return (
    <div style={styles.wrapper}>
      {/* Trial count selection */}
      <div style={styles.controls} className="glass">
        <div style={styles.controlGroup}>
          <label style={styles.label}>
            <Hash size={16} /> Deney Sayısı
          </label>
          <div style={styles.presets}>
            {TRIAL_PRESETS.map((n) => (
              <button
                key={n}
                className={`btn ${numTrials === n ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => {
                  playClick();
                  setNumTrials(n);
                }}
                disabled={isRunning}
              >
                {n.toLocaleString('tr-TR')}
              </button>
            ))}
          </div>
          <div style={styles.sliderRow}>
            <input
              type="range"
              min={100}
              max={100000}
              step={100}
              value={numTrials}
              onChange={(e) => setNumTrials(Number(e.target.value))}
              disabled={isRunning}
              style={styles.slider}
            />
            <span style={styles.sliderValue}>{numTrials.toLocaleString('tr-TR')}</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={runSimulation}
          disabled={isRunning}
          style={{ minWidth: 200, gap: 'var(--space-2)' }}
        >
          {isRunning ? <><Loader2 size={18} className="animate-spin" /> Simülasyon çalışıyor...</> : <><Play size={18} /> Simülasyonu Başlat</>}
        </button>
      </div>

      {/* Theoretical probabilities info */}
      <div style={styles.theoreticalInfo} className="glass">
        <div style={styles.theoreticalTitle}>
          <Ruler size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> 
          Teorik Olasılıklar ({numDoors} kapı)
        </div>
        <div style={styles.theoreticalRow}>
          <div style={styles.theoreticalItem}>
            <span style={styles.theoreticalLabel}>Kalma</span>
            <span style={styles.theoreticalValue}>
              %{(theoreticalStay * 100).toFixed(2)}
            </span>
            <span style={styles.theoreticalFormula}>1/{numDoors}</span>
          </div>
          <div style={styles.theoreticalItem}>
            <span style={styles.theoreticalLabel}>Değiştirme</span>
            <span style={{ ...styles.theoreticalValue, color: 'var(--color-accent-light)' }}>
              %{(theoreticalSwitch * 100).toFixed(2)}
            </span>
            <span style={styles.theoreticalFormula}>{numDoors - 1}/({numDoors}×{numDoors - 2})</span>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={styles.results} className="animate-slide-up">
          {/* Bar Chart */}
          <div style={styles.chartContainer} className="glass">
            <h3 style={styles.chartTitle}>Kazanma Oranları</h3>
            <div style={styles.chart}>
              {/* Stay bar */}
              <div style={styles.barGroup}>
                <div style={styles.barLabel}><Home size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Kalma</div>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.bar,
                      width: `${result.stay.winRate * 100}%`,
                      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    }}
                  >
                    <span style={styles.barValue}>
                      %{(result.stay.winRate * 100).toFixed(1)}
                    </span>
                  </div>
                  {/* Theoretical marker */}
                  <div
                    style={{
                      ...styles.theoreticalMarker,
                      left: `${result.stay.theoreticalRate * 100}%`,
                    }}
                    title={`Teorik: %${(result.stay.theoreticalRate * 100).toFixed(2)}`}
                  >
                    <div style={styles.theoreticalMarkerLine} />
                    <div style={styles.theoreticalMarkerLabel}>
                      T: %{(result.stay.theoreticalRate * 100).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Switch bar */}
              <div style={styles.barGroup}>
                <div style={styles.barLabel}><RefreshCw size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Değiştirme</div>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.bar,
                      width: `${result.switch.winRate * 100}%`,
                      background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-dark))',
                    }}
                  >
                    <span style={styles.barValue}>
                      %{(result.switch.winRate * 100).toFixed(1)}
                    </span>
                  </div>
                  {/* Theoretical marker */}
                  <div
                    style={{
                      ...styles.theoreticalMarker,
                      left: `${result.switch.theoreticalRate * 100}%`,
                    }}
                    title={`Teorik: %${(result.switch.theoreticalRate * 100).toFixed(2)}`}
                  >
                    <div style={styles.theoreticalMarkerLine} />
                    <div style={styles.theoreticalMarkerLabel}>
                      T: %{(result.switch.theoreticalRate * 100).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.chartLegend}>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--color-text-muted)' }} />
                Kesikli çizgi = Teorik olasılık
              </span>
            </div>
          </div>

          {/* Stats Table */}
          <div className="glass" style={styles.tableContainer}>
            <h3 style={styles.chartTitle}>Detaylı Sonuçlar</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Strateji</th>
                  <th style={styles.th}>Deney</th>
                  <th style={styles.th}>Kazanma</th>
                  <th style={styles.th}>Kaybetme</th>
                  <th style={styles.th}>Oran</th>
                  <th style={styles.th}>Teorik</th>
                  <th style={styles.th}>Sapma</th>
                </tr>
              </thead>
              <tbody>
                {[result.stay, result.switch].map((s) => {
                  const deviation = Math.abs(s.winRate - s.theoreticalRate) * 100;
                  return (
                    <tr key={s.strategy} style={styles.tr}>
                      <td style={styles.td}>
                        {s.strategy === 'stay' 
                          ? <><Home size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Kalma</> 
                          : <><RefreshCw size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Değiştirme</>}
                      </td>
                      <td style={styles.td}>{s.total.toLocaleString('tr-TR')}</td>
                      <td style={{ ...styles.td, color: 'var(--color-success)' }}>
                        {s.wins.toLocaleString('tr-TR')}
                      </td>
                      <td style={{ ...styles.td, color: 'var(--color-error)' }}>
                        {s.losses.toLocaleString('tr-TR')}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>
                        %{(s.winRate * 100).toFixed(2)}
                      </td>
                      <td style={{ ...styles.td, color: 'var(--color-text-muted)' }}>
                        %{(s.theoreticalRate * 100).toFixed(2)}
                      </td>
                      <td style={{
                        ...styles.td,
                        color: deviation < 1 ? 'var(--color-success)' : deviation < 3 ? 'var(--color-warning)' : 'var(--color-error)',
                      }}>
                        ±{deviation.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Insight */}
          <div style={styles.insight} className="glass">
            <div style={styles.insightIcon}><Lightbulb size={32} color="var(--color-accent-light)" /></div>
            <div>
              <strong style={{ color: 'var(--color-accent-light)' }}>Ne öğreniyoruz?</strong>
              <p style={styles.insightText}>
                {numDoors === 3
                  ? 'Klasik 3 kapılı Monty Hall probleminde, kapıyı değiştirmek kazanma olasılığını %33\'ten %67\'ye çıkarır — tam 2 kat artış!'
                  : `${numDoors} kapılı versiyonda, kalma stratejisi %${(theoreticalStay * 100).toFixed(1)} kazanma oranı verirken, değiştirme stratejisi %${(theoreticalSwitch * 100).toFixed(1)} verir.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
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
    flexWrap: 'wrap',
    gap: 'var(--space-6)',
    alignItems: 'flex-end',
  },
  controlGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    minWidth: 250,
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
  presets: {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  slider: {
    flex: 1,
    height: 6,
    appearance: 'none' as const,
    background: 'linear-gradient(90deg, var(--color-accent-dark), var(--color-accent-light))',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
  },
  sliderValue: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
    color: 'var(--color-accent-light)',
    minWidth: 60,
    textAlign: 'right' as const,
  },
  theoreticalInfo: {
    padding: 'var(--space-4) var(--space-6)',
  },
  theoreticalTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-3)',
  },
  theoreticalRow: {
    display: 'flex',
    gap: 'var(--space-8)',
    flexWrap: 'wrap' as const,
  },
  theoreticalItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  theoreticalLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
  },
  theoreticalValue: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 800,
    color: 'var(--color-warning)',
  },
  theoreticalFormula: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    fontFamily: 'monospace',
  },
  results: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-6)',
  },
  chartContainer: {
    padding: 'var(--space-6)',
  },
  chartTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    marginBottom: 'var(--space-6)',
    color: 'var(--color-text)',
  },
  chart: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-6)',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  barLabel: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  barTrack: {
    position: 'relative' as const,
    height: 40,
    background: 'var(--color-surface-active)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'visible',
  },
  bar: {
    height: '100%',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 'var(--space-3)',
    transition: 'width 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    minWidth: 80,
  },
  barValue: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  theoreticalMarker: {
    position: 'absolute' as const,
    top: -6,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  theoreticalMarkerLine: {
    width: 2,
    height: 52,
    background: 'var(--color-text-muted)',
    opacity: 0.7,
    borderLeft: '2px dashed var(--color-text-muted)',
  },
  theoreticalMarkerLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap' as const,
    marginTop: 2,
  },
  chartLegend: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginTop: 'var(--space-4)',
    justifyContent: 'flex-end',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  legendDot: {
    width: 12,
    height: 2,
    borderRadius: 'var(--radius-full)',
    borderTop: '2px dashed var(--color-text-muted)',
  },
  tableContainer: {
    padding: 'var(--space-6)',
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 'var(--font-size-sm)',
  },
  th: {
    padding: 'var(--space-3) var(--space-4)',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-xs)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tr: {
    transition: 'background var(--transition-fast)',
  },
  td: {
    padding: 'var(--space-3) var(--space-4)',
    borderBottom: '1px solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
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
    marginTop: 'var(--space-1)',
    lineHeight: 1.7,
  },
};

export default BulkSimulation;
