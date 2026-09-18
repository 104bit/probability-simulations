/* ============================================================
   BankrollChart — SVG Line Chart of Bankroll Over Time
   ============================================================ */

import React from 'react';
import type { RoundResult } from '../types';

interface BankrollChartProps {
  rounds: RoundResult[];
  initialBankroll: number;
  targetProfit: number | null;
}

const CHART_W = 700;
const CHART_H = 220;
const PAD = { top: 16, right: 20, bottom: 32, left: 56 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const BankrollChart: React.FC<BankrollChartProps> = ({ rounds, initialBankroll, targetProfit }) => {
  if (rounds.length === 0) return null;

  // Data points: başlangıç + her tur sonu
  const values = [initialBankroll, ...rounds.map(r => r.bankroll)];
  const maxVal = Math.max(...values, initialBankroll * 1.2, targetProfit ? initialBankroll + targetProfit : 0);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const xScale = (i: number) => PAD.left + (i / (values.length - 1 || 1)) * INNER_W;
  const yScale = (v: number) => PAD.top + (1 - (v - minVal) / range) * INNER_H;

  // Path
  const pathD = values.map((v, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`
  ).join(' ');

  // Fill path (area under curve)
  const areaD = `${pathD} L${xScale(values.length - 1).toFixed(1)},${yScale(minVal).toFixed(1)} L${xScale(0).toFixed(1)},${yScale(minVal).toFixed(1)} Z`;

  // Final value
  const finalVal = values[values.length - 1];
  const profit = finalVal - initialBankroll;
  const isBankrupt = finalVal <= 0;

  // Y ticks
  const yTicks: number[] = [];
  const step = Math.pow(10, Math.floor(Math.log10(range))) / 2 || 50;
  for (let v = Math.ceil(minVal / step) * step; v <= maxVal; v += step) {
    yTicks.push(v);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>📈</span>
        <span style={styles.headerText}>Bakiye Grafiği</span>
        <span style={{
          ...styles.profitBadge,
          color: profit >= 0 ? 'var(--color-success)' : 'var(--color-error)',
          background: profit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: profit >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        }}>
          {profit >= 0 ? '+' : ''}{profit.toFixed(0)}₺
        </span>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ width: '100%', height: 'auto' }}>
        {/* Y grid + labels */}
        {yTicks.map(v => (
          <g key={v}>
            <line
              x1={PAD.left} y1={yScale(v)}
              x2={CHART_W - PAD.right} y2={yScale(v)}
              stroke="var(--color-border)" strokeWidth={0.5} opacity={0.5}
            />
            <text x={PAD.left - 8} y={yScale(v) + 4} textAnchor="end"
              fontSize="9" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif">
              {v.toFixed(0)}₺
            </text>
          </g>
        ))}

        {/* Initial bankroll line */}
        <line
          x1={PAD.left} y1={yScale(initialBankroll)}
          x2={CHART_W - PAD.right} y2={yScale(initialBankroll)}
          stroke="#f59e0b" strokeWidth={1} strokeDasharray="6 3" opacity={0.6}
        />
        <text x={CHART_W - PAD.right + 4} y={yScale(initialBankroll) + 3}
          fontSize="8" fill="#f59e0b" fontFamily="Inter, sans-serif">
          Başlangıç
        </text>

        {/* Target line */}
        {targetProfit !== null && (
          <>
            <line
              x1={PAD.left} y1={yScale(initialBankroll + targetProfit)}
              x2={CHART_W - PAD.right} y2={yScale(initialBankroll + targetProfit)}
              stroke="var(--color-success)" strokeWidth={1} strokeDasharray="4 2" opacity={0.5}
            />
            <text x={CHART_W - PAD.right + 4} y={yScale(initialBankroll + targetProfit) + 3}
              fontSize="8" fill="var(--color-success)" fontFamily="Inter, sans-serif">
              Hedef
            </text>
          </>
        )}

        {/* Zero line */}
        {minVal < 0 && (
          <line
            x1={PAD.left} y1={yScale(0)}
            x2={CHART_W - PAD.right} y2={yScale(0)}
            stroke="var(--color-error)" strokeWidth={1} opacity={0.3}
          />
        )}

        {/* Area fill */}
        <path d={areaD} fill={isBankrupt ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)'} />

        {/* Line */}
        <path d={pathD} fill="none"
          stroke={isBankrupt ? '#ef4444' : '#f59e0b'}
          strokeWidth={2} strokeLinejoin="round"
        />

        {/* End dot */}
        <circle
          cx={xScale(values.length - 1)} cy={yScale(finalVal)}
          r={4}
          fill={isBankrupt ? '#ef4444' : profit >= 0 ? '#22c55e' : '#f59e0b'}
          stroke="white" strokeWidth={1.5}
        />

        {/* X axis label */}
        <text x={PAD.left + INNER_W / 2} y={CHART_H - 4}
          textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" fontFamily="Inter, sans-serif">
          Tur ({rounds.length} tur)
        </text>
      </svg>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  headerIcon: {
    fontSize: 'var(--font-size-base)',
  },
  headerText: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  profitBadge: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    marginLeft: 'auto',
  },
};

export default BankrollChart;
