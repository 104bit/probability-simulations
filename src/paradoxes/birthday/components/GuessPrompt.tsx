/* ============================================================
   GuessPrompt — Interactive Guess Before Experiment
   ============================================================ */

import React, { useState } from 'react';
import { HelpCircle, Target, ArrowRight } from 'lucide-react';
import { useSound } from '../../../hooks/useSound';

interface GuessPromptProps {
  onGuessSubmit: (guess: number) => void;
  onSkip: () => void;
}

const GuessPrompt: React.FC<GuessPromptProps> = ({ onGuessSubmit, onSkip }) => {
  const { playClick, playPop } = useSound();
  const [guess, setGuess] = useState(50);

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="glass">
        <div style={styles.iconRow}>
          <span style={styles.icon}>
            <HelpCircle size={48} color="#ec4899" />
          </span>
        </div>
        <h2 style={styles.question}>
          Kaç kişilik bir grupta en az iki kişinin doğum günü aynı olma olasılığı <strong style={{ color: '#ec4899' }}>%50</strong>'yi geçer?
        </h2>
        <p style={styles.hint}>
          Sezginizi test edin! Doğru cevabı görmeden önce tahmininizi yapın.
        </p>

        <div style={styles.sliderSection}>
          <div style={styles.guessDisplay}>
            <span style={styles.guessNumber}>{guess}</span>
            <span style={styles.guessUnit}>kişi</span>
          </div>
          <input
            type="range"
            min={2}
            max={100}
            value={guess}
            onChange={(e) => {
              playClick();
              setGuess(Number(e.target.value));
            }}
            style={styles.slider}
          />
          <div style={styles.sliderLabels}>
            <span>2</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            className="btn btn-lg"
            style={{ ...styles.submitBtn, gap: 'var(--space-2)' }}
            onClick={() => {
              playPop();
              onGuessSubmit(guess);
            }}
          >
            <Target size={18} /> Tahmini Gönder
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ gap: 'var(--space-2)' }}
            onClick={() => {
              playClick();
              onSkip();
            }}
          >
            Tahmin etmeden devam et <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-4) 0',
  },
  card: {
    maxWidth: 520,
    width: '100%',
    padding: 'var(--space-8)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-6)',
    textAlign: 'center' as const,
  },
  iconRow: {
    display: 'flex',
    gap: 'var(--space-2)',
  },
  icon: {
    fontSize: 'var(--font-size-4xl)',
  },
  question: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--color-text)',
    lineHeight: 1.6,
  },
  hint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
  },
  sliderSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  guessDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--space-2)',
  },
  guessNumber: {
    fontSize: 'var(--font-size-5xl)',
    fontWeight: 800,
    color: '#ec4899',
    lineHeight: 1,
  },
  guessUnit: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
  },
  slider: {
    width: '100%',
    height: 6,
    appearance: 'none' as const,
    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
  },
  sliderLabels: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
    border: 'none',
  },
};

export default GuessPrompt;
