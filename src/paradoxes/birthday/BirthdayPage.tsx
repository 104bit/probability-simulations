/* ============================================================
   BirthdayPage — Main Page for Birthday Paradox
   ============================================================ */

import React, { useState } from 'react';
import { Cake, Target, Gamepad2, BarChart2, Users } from 'lucide-react';
import GuessPrompt from './components/GuessPrompt';
import SingleExperiment from './components/SingleExperiment';
import BulkSimulation from './components/BulkSimulation';

type Mode = 'single' | 'bulk';

const BirthdayPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('single');
  const [groupSize, setGroupSize] = useState(30);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [guessPhase, setGuessPhase] = useState<'asking' | 'done'>('asking');

  const handleGuessSubmit = (guess: number) => {
    setUserGuess(guess);
    setGuessPhase('done');
  };

  const handleSkip = () => {
    setGuessPhase('done');
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.badge}>Olasılık Paradoksu</div>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>
              <Cake size={40} />
            </span>
            Doğum Günü Paradoksu
          </h1>
          <p style={styles.description}>
            Bir sınıfta kaç kişi olursa en az ikisinin doğum günü aynı olur?
            Cevap sizi şaşırtacak — çünkü insan sezgisi olasılıkta yanılır.
          </p>
        </div>
      </header>

      {/* Guess prompt — only before first interaction */}
      {guessPhase === 'asking' && (
        <GuessPrompt onGuessSubmit={handleGuessSubmit} onSkip={handleSkip} />
      )}

      {/* After guess, show experiment */}
      {guessPhase === 'done' && (
        <>
          {/* Guess result mini banner */}
          {userGuess !== null && (
            <div style={styles.guessBanner} className="glass animate-fade-in">
              <Target size={18} />
              <span>
                Tahmininiz: <strong style={{ color: '#ec4899' }}>{userGuess} kişi</strong>
                {' '}— Doğru cevap: <strong style={{ color: 'var(--color-success)' }}>23 kişi</strong>
                {' '}(Fark: {Math.abs(userGuess - 23)} kişi)
              </span>
            </div>
          )}

          {/* Mode toggle */}
          <div style={styles.modeToggle}>
            <button
              className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('single')}
              style={{ ...(mode === 'single' ? styles.activeBtn : {}), gap: 'var(--space-2)' }}
            >
              <Gamepad2 size={18} /> Tek Deney
            </button>
            <button
              className={`btn ${mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('bulk')}
              style={{ ...(mode === 'bulk' ? styles.activeBtn : {}), gap: 'var(--space-2)' }}
            >
              <BarChart2 size={18} /> Toplu Simülasyon
            </button>
          </div>

          {/* Mode content */}
          {mode === 'single' ? (
            <>
              {/* Group size control */}
              <div className="glass" style={styles.sizeControl}>
                <div style={styles.sizeGroup}>
                  <label style={styles.sizeLabel}>
                    <Users size={16} /> Grup Boyutu
                  </label>
                  <div style={styles.sliderRow}>
                    <input
                      type="range"
                      min={5}
                      max={70}
                      value={groupSize}
                      onChange={(e) => setGroupSize(Number(e.target.value))}
                      style={styles.slider}
                    />
                    <span style={styles.sliderValue}>{groupSize}</span>
                  </div>
                  <span style={styles.sizeHint}>
                    Bu boyutta teorik eşleşme olasılığı:{' '}
                    <strong style={{ color: '#ec4899' }}>
                      %{(birthdayProb(groupSize) * 100).toFixed(1)}
                    </strong>
                  </span>
                </div>
              </div>
              <SingleExperiment
                key={groupSize}
                groupSize={groupSize}
                userGuess={userGuess}
              />
            </>
          ) : (
            <BulkSimulation userGuess={userGuess} />
          )}
        </>
      )}
    </div>
  );
};

/** Inline probability for display (avoids importing in render) */
function birthdayProb(n: number): number {
  if (n <= 1) return 0;
  if (n >= 365) return 1;
  let p = 1;
  for (let i = 0; i < n; i++) p *= (365 - i) / 365;
  return 1 - p;
}

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
    color: '#ec4899',
    background: 'rgba(236, 72, 153, 0.1)',
    padding: 'var(--space-1) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(236, 72, 153, 0.2)',
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
    fontSize: 'var(--font-size-4xl)',
  },
  description: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-muted)',
    maxWidth: 600,
    lineHeight: 1.7,
  },
  guessBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-5)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    justifyContent: 'center',
  },
  modeToggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-3)',
  },
  activeBtn: {
    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
  },
  sizeControl: {
    display: 'flex',
    padding: 'var(--space-4) var(--space-6)',
    justifyContent: 'center',
  },
  sizeGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
    minWidth: 300,
  },
  sizeLabel: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
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
    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
  },
  sliderValue: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 800,
    color: '#ec4899',
    minWidth: 40,
    textAlign: 'right' as const,
  },
  sizeHint: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
};

export default BirthdayPage;
