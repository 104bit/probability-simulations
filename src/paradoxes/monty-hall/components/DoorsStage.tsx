/* ============================================================
   DoorsStage — Container for Door Grid Layout
   ============================================================ */

import React from 'react';
import DoorSVG from './DoorSVG';
import type { DoorInfo, DoorState } from '../types';

interface DoorsStageProps {
  doors: DoorInfo[];
  overrideStates?: Map<number, DoorState>;
  onDoorClick?: (index: number) => void;
  disabledDoors?: Set<number>;
  xray?: boolean;
  doorSize?: number;
}

const DoorsStage: React.FC<DoorsStageProps> = ({
  doors,
  overrideStates,
  onDoorClick,
  disabledDoors = new Set(),
  xray = false,
  doorSize = 140,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.stage} className="stagger-children">
        {doors.map((door) => {
          const state = overrideStates?.get(door.index) ?? door.state;
          return (
            <DoorSVG
              key={door.index}
              index={door.index}
              state={state}
              hasPrize={door.hasPrize}
              onClick={onDoorClick ? () => onDoorClick(door.index) : undefined}
              disabled={disabledDoors.has(door.index)}
              showContent={state === 'revealed' || state === 'won' || state === 'lost'}
              xray={xray}
              size={doorSize}
            />
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-8) 0',
  },
  stage: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-6)',
    justifyContent: 'center',
    alignItems: 'flex-end',
    maxWidth: '900px',
  },
};

export default DoorsStage;
