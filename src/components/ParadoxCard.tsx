/* ============================================================
   ParadoxCard — Card for home page paradox grid
   ============================================================ */

import React from 'react';
import type { ParadoxEntry } from '../paradoxes/registry';

interface ParadoxCardProps {
  paradox: ParadoxEntry;
  onClick: () => void;
}

const ParadoxCard: React.FC<ParadoxCardProps> = ({ paradox, onClick }) => {
  return (
    <button onClick={onClick} style={styles.card} className="glass glass-hover">
      <div style={{
        ...styles.iconContainer,
        background: `${paradox.color}15`,
        border: `1px solid ${paradox.color}30`,
      }}>
        <span style={styles.icon}>{paradox.icon}</span>
      </div>
      <h3 style={styles.title}>{paradox.title}</h3>
      <p style={styles.description}>{paradox.description}</p>
      <div style={{
        ...styles.explore,
        color: paradox.color,
      }}>
        Keşfet →
      </div>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
    padding: 'var(--space-8)',
    textAlign: 'left' as const,
    width: '100%',
    transition: 'all var(--transition-base)',
    cursor: 'pointer',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 'var(--font-size-2xl)',
  },
  title: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: 1.3,
  },
  description: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
    flex: 1,
  },
  explore: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    transition: 'gap var(--transition-fast)',
  },
};

export default ParadoxCard;
