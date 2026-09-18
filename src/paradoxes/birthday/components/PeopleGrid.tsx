/* ============================================================
   PeopleGrid — Grid of Person Avatars
   ============================================================ */

import React from 'react';
import { Users } from 'lucide-react';
import PersonAvatar from './PersonAvatar';
import type { Person } from '../types';

interface PeopleGridProps {
  people: Person[];
  latestId?: number; // ID of most recently added person (for animation)
}

const PeopleGrid: React.FC<PeopleGridProps> = ({ people, latestId }) => {
  // Avatar boyutunu kişi sayısına göre ayarla
  const getAvatarSize = () => {
    if (people.length <= 15) return 56;
    if (people.length <= 30) return 48;
    if (people.length <= 50) return 40;
    return 34;
  };

  return (
    <div style={styles.container}>
      {people.length === 0 ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}><Users size={48} color="var(--color-text-muted)" /></span>
          <span style={styles.emptyText}>Kişiler burada görünecek</span>
        </div>
      ) : (
        <div style={styles.grid}>
          {people.map(person => (
            <PersonAvatar
              key={person.id}
              person={person}
              size={getAvatarSize()}
              isNew={person.id === latestId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    minHeight: 120,
    padding: 'var(--space-4)',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 'var(--space-3)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-8)',
    opacity: 0.4,
  },
  emptyIcon: {
    fontSize: 'var(--font-size-3xl)',
  },
  emptyText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
};

export default PeopleGrid;
