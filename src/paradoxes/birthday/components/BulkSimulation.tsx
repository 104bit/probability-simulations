/* ============================================================
   BulkSimulation — Mass Simulation + Probability Curve Chart
   ============================================================
   SVG bazlı olasılık eğrisi grafiği.
   Teorik eğri + simülasyon noktaları + %50 eşiği + N=23 vurgu.
   ============================================================ */

import React, { useState, useCallback } from 'react';
import { Hash, Users, Lightbulb, Play, Loader2 } from 'lucide-react';
import { runBulkBirthdaySimulation, calculateBirthdayProbability } from '../simulation';
import type { BulkResult } from '../types';
import { useSound } from '../../../hooks/useSound';

interface BulkSimulationProps {
  userGuess: number | null;
}

const TRIAL_PRESETS = [500, 1_000, 5_000, 10_000];

const BulkSimulation: React.FC<BulkSimulationProps> = ({ userGuess }) => {
  const { playClick, playSuccess } = useSound();
  const [numTrials, setNumTrials] = useState(1000);
  const [maxGroupSize, setMaxGroupSize] = useState(70);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = useCallback(() => {
    playClick();
    setIsRunning(true);
    setTimeout(() => {
      const res = runBulkBirthdaySimulation({ maxGroupSize, numTrials });
      setResult(res);
      setIsRunning(false);
      playSuccess();
    }, 50);
  }, [maxGroupSize, numTrials, playClick, playSuccess]);

  return (
    <div style={styles.wrapper}>
      {/* Controls */}
      <div style={styles.controls} className="glass">
        <div style={styles.controlGroup}>
          <label style={styles.label}><Hash size={16} /> Deney Sayısı</label>
          <div style={styles.presets}>
            {TRIAL_PRESETS.map(n => (
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
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}><Users size={16} /> Maks Grup: {maxGroupSize}</label>
          <input
            type="range"
            min={30}
            max={100}
            value={maxGroupSize}
            onChange={(e) => setMaxGroupSize(Number(e.target.value))}
            onMouseUp={() => playClick()}
            disabled={isRunning}
            style={styles.slider}
          />
        </div>

        <button
          className="btn btn-lg"
          style={{ ...styles.runBtn, gap: 'var(--space-2)' }}
          onClick={runSimulation}
          disabled={isRunning}
        >
          {isRunning ? <><Loader2 size={18} className="animate-spin" /> Çalışıyor...</> : <><Play size={18} /> Simülasyonu Başlat</>}
        </button>
      </div>

      {/* Chart */}
      {result && (
        <div className="animate-slide-up">
          <div style={styles.chartContainer} className="glass">
            <h3 style={styles.chartTitle}>Eşleşme Olasılığı Eğrisi</h3>
            <ProbabilityChart
              result={result}
              maxGroupSize={maxGroupSize}
              userGuess={userGuess}
            />
          </div>

          {/* Key insight */}
          <div style={styles.insight} className="glass">
            <div style={styles.insightIcon}><Lightbulb size={32} color="#ec4899" /></div>
            <div>
              <strong style={{ color: '#ec4899' }}>Neden "paradoks"?</strong>
              <p style={styles.insightText}>
                Sezgisel olarak 365 günün yarısı olan ~183 kişi beklenir.
                Gerçek cevap sadece <strong>23 kişi</strong> — çünkü her yeni kişi,
                gruptaki <em>herkes</em> ile karşılaştırılır. N kişide N×(N-1)/2 ikili
                karşılaştırma yapılır. 23 kişide bu 253 karşılaştırma demektir!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   SVG Probability Curve Chart
   ============================================================ */

interface ProbabilityChartProps {
  result: BulkResult;
  maxGroupSize: number;
  userGuess: number | null;
}

const CHART_W = 700;
const CHART_H = 320;
const PAD = { top: 20, right: 30, bottom: 40, left: 50 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ result, maxGroupSize, userGuess }) => {
  const xScale = (n: number) => PAD.left + ((n - 2) / (maxGroupSize - 2)) * INNER_W;
  const yScale = (p: number) => PAD.top + (1 - p) * INNER_H;

  // Teorik eğri path
  const theoreticalPoints: string[] = [];
  for (let n = 2; n <= maxGroupSize; n++) {
    const p = calculateBirthdayProbability(n);
    const x = xScale(n);
    const y = yScale(p);
    theoreticalPoints.push(`${n === 2 ? 'M' : 'L'}${x},${y}`);
  }
  const theoreticalPath = theoreticalPoints.join(' ');

  // Simülasyon noktaları
  const simPoints = result.results;

  // Y grid lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  // X ticks
  const xTicks: number[] = [];
  for (let n = 10; n <= maxGroupSize; n += 10) xTicks.push(n);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      style={{ width: '100%', height: 'auto', maxHeight: 360 }}
    >
      {/* Grid lines */}
      {yTicks.map(t => (
        <g key={t}>
          <line
            x1={PAD.left} y1={yScale(t)}
            x2={CHART_W - PAD.right} y2={yScale(t)}
            stroke="var(--color-border)"
            strokeWidth={t === 0.5 ? 1.5 : 0.5}
            strokeDasharray={t === 0.5 ? '6 3' : undefined}
            opacity={t === 0.5 ? 0.8 : 0.4}
          />
          <text
            x={PAD.left - 8} y={yScale(t) + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--color-text-muted)"
            fontFamily="Inter, sans-serif"
          >
            %{(t * 100).toFixed(0)}
          </text>
        </g>
      ))}

      {/* %50 label */}
      <text
        x={CHART_W - PAD.right + 4}
        y={yScale(0.5) + 4}
        fontSize="9"
        fontWeight="700"
        fill="#fbbf24"
        fontFamily="Inter, sans-serif"
      >
        %50
      </text>

      {/* X axis ticks */}
      {xTicks.map(n => (
        <g key={n}>
          <line
            x1={xScale(n)} y1={PAD.top}
            x2={xScale(n)} y2={CHART_H - PAD.bottom}
            stroke="var(--color-border)"
            strokeWidth={0.3}
            opacity={0.3}
          />
          <text
            x={xScale(n)} y={CHART_H - PAD.bottom + 16}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-text-muted)"
            fontFamily="Inter, sans-serif"
          >
            {n}
          </text>
        </g>
      ))}

      {/* X axis label */}
      <text
        x={PAD.left + INNER_W / 2}
        y={CHART_H - 4}
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-text-muted)"
        fontFamily="Inter, sans-serif"
      >
        Kişi sayısı
      </text>

      {/* N=23 vertical highlight */}
      <line
        x1={xScale(23)} y1={PAD.top}
        x2={xScale(23)} y2={CHART_H - PAD.bottom}
        stroke="#ec4899"
        strokeWidth={1.5}
        strokeDasharray="4 2"
        opacity={0.6}
      />
      <text
        x={xScale(23)} y={PAD.top - 6}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#ec4899"
        fontFamily="Inter, sans-serif"
      >
        N=23
      </text>

      {/* User guess vertical line */}
      {userGuess !== null && userGuess >= 2 && userGuess <= maxGroupSize && (
        <>
          <line
            x1={xScale(userGuess)} y1={PAD.top}
            x2={xScale(userGuess)} y2={CHART_H - PAD.bottom}
            stroke="var(--color-accent-light)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            opacity={0.6}
          />
          <text
            x={xScale(userGuess)}
            y={PAD.top - 6}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="var(--color-accent-light)"
            fontFamily="Inter, sans-serif"
          >
            Tahmin: {userGuess}
          </text>
        </>
      )}

      {/* Theoretical curve */}
      <path
        d={theoreticalPath}
        fill="none"
        stroke="#ec4899"
        strokeWidth={2.5}
        opacity={0.9}
      />

      {/* Simulation dots */}
      {simPoints.map((sp, i) => (
        <circle
          key={i}
          cx={xScale(sp.groupSize)}
          cy={yScale(sp.matchRate)}
          r={2.5}
          fill="var(--color-accent-light)"
          opacity={0.6}
        />
      ))}

      {/* Legend */}
      <g transform={`translate(${PAD.left + 8}, ${PAD.top + 8})`}>
        <line x1="0" y1="0" x2="16" y2="0" stroke="#ec4899" strokeWidth="2.5" />
        <text x="20" y="4" fontSize="10" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif">
          Teorik
        </text>
        <circle cx="8" cy="14" r="3" fill="var(--color-accent-light)" opacity="0.6" />
        <text x="20" y="18" fontSize="10" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif">
          Simülasyon
        </text>
      </g>
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
    minWidth: 180,
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
  slider: {
    width: '100%',
    height: 4,
    appearance: 'none' as const,
    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
  },
  runBtn: {
    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
    border: 'none',
    minWidth: 200,
  },
  chartContainer: {
    padding: 'var(--space-6)',
  },
  chartTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    marginBottom: 'var(--space-4)',
  },
  insight: {
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    gap: 'var(--space-4)',
    alignItems: 'flex-start',
    marginTop: 'var(--space-4)',
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
