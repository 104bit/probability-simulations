/* ============================================================
   CalendarView — Compact 12-Month Calendar
   ============================================================
   Kullanılan günler noktayla, eşleşen günler parlak vurguyla
   gösterilir.
   ============================================================ */

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Person } from '../types';
import { MONTH_NAMES, DAYS_IN_MONTH } from '../types';

interface CalendarViewProps {
  people: Person[];
  matchDay: number | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({ people, matchDay }) => {
  // Doğum günlerini ay/gün bazında grupla
  const birthdayMap = new Map<string, Person[]>();
  people.forEach(p => {
    const key = `${p.month}-${p.day}`;
    const existing = birthdayMap.get(key) || [];
    existing.push(p);
    birthdayMap.set(key, existing);
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerIcon}><CalendarIcon size={16} /></span>
        <span style={styles.headerText}>Takvim</span>
      </div>
      <div style={styles.months}>
        {MONTH_NAMES.map((monthName, monthIdx) => (
          <div key={monthIdx} style={styles.month}>
            <div style={styles.monthName}>{monthName}</div>
            <div style={styles.days}>
              {Array.from({ length: DAYS_IN_MONTH[monthIdx] }, (_, dayIdx) => {
                const key = `${monthIdx}-${dayIdx + 1}`;
                const personsOnDay = birthdayMap.get(key) || [];
                const hasOccupant = personsOnDay.length > 0;
                const isMatch = personsOnDay.length >= 2;
                const isMatchDay = matchDay !== null && personsOnDay.some(p => p.birthday === matchDay);

                return (
                  <div
                    key={dayIdx}
                    title={hasOccupant
                      ? `${dayIdx + 1} ${monthName}: ${personsOnDay.map(p => `#${p.id + 1}`).join(', ')}`
                      : `${dayIdx + 1} ${monthName}`
                    }
                    style={{
                      ...styles.day,
                      background: isMatch || isMatchDay
                        ? 'rgba(244, 63, 94, 0.7)'
                        : hasOccupant
                        ? 'rgba(99, 102, 241, 0.5)'
                        : 'var(--color-surface-active)',
                      boxShadow: isMatch || isMatchDay
                        ? '0 0 6px rgba(244, 63, 94, 0.5)'
                        : 'none',
                      transform: isMatch || isMatchDay ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: 'var(--color-surface-active)' }} />
          <span>Boş</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: 'rgba(99, 102, 241, 0.5)' }} />
          <span>Dolu</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: 'rgba(244, 63, 94, 0.7)', boxShadow: '0 0 4px rgba(244, 63, 94, 0.5)' }} />
          <span>Eşleşme!</span>
        </div>
      </div>
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
  headerIcon: {
    fontSize: 'var(--font-size-base)',
  },
  headerText: {
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  months: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--space-2)',
  },
  month: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
  },
  monthName: {
    fontSize: 9,
    fontWeight: 700,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  days: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 1.5,
  },
  day: {
    width: 5,
    height: 5,
    borderRadius: 1,
    transition: 'all 300ms ease',
  },
  legend: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginTop: 'var(--space-1)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    fontSize: 9,
    color: 'var(--color-text-muted)',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
};

export default CalendarView;
