/* ============================================================
   SingleSession — Step-by-Step Martingale Experiment
   ============================================================ */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Snail, Rabbit, Calculator, AlertTriangle, AlertCircle, TrendingUp
} from 'lucide-react';
import RouletteWheel from './RouletteWheel';
import BankrollChart from './BankrollChart';
import BetEscalation from './BetEscalation';
import type { RoundResult, SessionPhase, SessionConfig } from '../types';
import { betAfterStreak, totalLossAfterStreak } from '../simulation';
import { useSound } from '../../../hooks/useSound';

interface SingleSessionProps {
  config: SessionConfig;
}

const SingleSession: React.FC<SingleSessionProps> = ({ config }) => {
  const { initialBankroll, baseBet, winProbability, maxRounds, targetProfit } = config;
  const { playClick, playCoin, playSuccess, playError } = useSound();

  const [phase, setPhase] = useState<SessionPhase>('setup');
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [bankroll, setBankroll] = useState(initialBankroll);
  const [currentBet, setCurrentBet] = useState(baseBet);
  const [consecutiveLosses, setConsecutiveLosses] = useState(0);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [isShaking, setIsShaking] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // State refs for interval callback
  const stateRef = useRef({ bankroll, currentBet, consecutiveLosses, rounds: rounds as RoundResult[] });
  useEffect(() => {
    stateRef.current = { bankroll, currentBet, consecutiveLosses, rounds };
  }, [bankroll, currentBet, consecutiveLosses, rounds]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  const playOneRound = useCallback(() => {
    const s = stateRef.current;
    if (s.bankroll <= 0 || s.rounds.length >= maxRounds) return false;

    const actualBet = Math.min(s.currentBet, s.bankroll);
    if (actualBet <= 0) return false;

    const won = Math.random() < winProbability;
    const payout = won ? actualBet : -actualBet;
    const newBankroll = s.bankroll + payout;
    const newConsecutive = won ? 0 : s.consecutiveLosses + 1;
    const newBet = won ? baseBet : actualBet * 2;

    const result: RoundResult = {
      round: s.rounds.length,
      bet: actualBet,
      won,
      payout,
      bankroll: newBankroll,
      consecutiveLosses: newConsecutive,
    };

    const newRounds = [...s.rounds, result];
    setRounds(newRounds);
    setBankroll(newBankroll);
    setCurrentBet(newBet);
    setConsecutiveLosses(newConsecutive);
    setLastResult(won);
    setIsFlipping(true);
    
    // Play sounds
    playCoin();

    setTimeout(() => setIsFlipping(false), 300);

    stateRef.current = { bankroll: newBankroll, currentBet: newBet, consecutiveLosses: newConsecutive, rounds: newRounds };

    // Check end conditions
    if (newBankroll <= 0) {
      setPhase('bankrupt');
      playError();
      triggerShake();
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return false;
    }
    if (targetProfit !== null && newBankroll >= initialBankroll + targetProfit) {
      setPhase('target_reached');
      playSuccess();
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return false;
    }
    if (newRounds.length >= maxRounds) {
      setPhase('max_rounds');
      if (newBankroll > initialBankroll) playSuccess();
      else playError();
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return false;
    }
    return true;
  }, [baseBet, winProbability, maxRounds, targetProfit, initialBankroll, playCoin, playError, playSuccess, triggerShake]);

  const play = useCallback(() => {
    if (phase === 'bankrupt' || phase === 'target_reached' || phase === 'max_rounds') return;
    playClick();
    setPhase('running');
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      const cont = playOneRound();
      if (!cont && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, speed);
  }, [playOneRound, speed, phase, playClick]);

  useEffect(() => {
    if (phase === 'running' && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        const cont = playOneRound();
        if (!cont && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      }, speed);
    }
  }, [speed, phase, playOneRound]);

  const pause = useCallback(() => {
    playClick();
    setPhase('paused');
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, [playClick]);

  const step = useCallback(() => {
    if (phase === 'bankrupt' || phase === 'target_reached' || phase === 'max_rounds') return;
    playClick();
    setPhase('paused');
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    playOneRound();
  }, [playOneRound, phase, playClick]);

  const reset = useCallback(() => {
    playClick();
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setPhase('setup');
    setRounds([]);
    setBankroll(initialBankroll);
    setCurrentBet(baseBet);
    setConsecutiveLosses(0);
    setLastResult(null);
    setIsFlipping(false);
    stateRef.current = { bankroll: initialBankroll, currentBet: baseBet, consecutiveLosses: 0, rounds: [] };
  }, [initialBankroll, baseBet, playClick]);

  const isFinished = phase === 'bankrupt' || phase === 'target_reached' || phase === 'max_rounds';
  const profit = bankroll - initialBankroll;
  const history = rounds.map(r => r.won);

  return (
    <div style={{ ...styles.wrapper, animation: isShaking ? 'shake 500ms ease-in-out' : 'none' }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
      `}</style>
      
      {/* Controls */}
      <div style={styles.controls} className="glass">
        <div style={styles.controlRow}>
          <div style={styles.playback}>
            {phase === 'running' ? (
              <button className="btn btn-secondary" onClick={pause} style={{ gap: 'var(--space-2)' }}>
                <Pause size={16} /> Duraklat
              </button>
            ) : (
              <button className="btn btn-primary" onClick={play} disabled={isFinished} style={{ gap: 'var(--space-2)' }}>
                <Play size={16} fill="currentColor" /> {phase === 'setup' ? 'Başlat' : 'Devam'}
              </button>
            )}
            <button className="btn btn-secondary" onClick={step} disabled={isFinished} style={{ gap: 'var(--space-2)' }}>
              <SkipForward size={16} /> Adım
            </button>
            <button className="btn btn-secondary" onClick={reset} style={{ gap: 'var(--space-2)' }}>
              <RotateCcw size={16} /> Sıfırla
            </button>
          </div>
          <div style={styles.speedControl}>
            <Snail size={18} style={{ color: 'var(--color-text-muted)' }} />
            <input type="range" min={50} max={800} step={50}
              value={850 - speed}
              onChange={(e) => setSpeed(850 - Number(e.target.value))}
              style={styles.speedSlider}
            />
            <Rabbit size={18} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{
        ...styles.status,
        color: phase === 'bankrupt' ? 'var(--color-error)' :
          phase === 'target_reached' ? 'var(--color-success)' : 'var(--color-text-secondary)',
        fontWeight: isFinished ? 700 : 500,
      }}>
        {phase === 'setup' && <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Play size={16} /> Başlat butonuna tıklayın</span>}
        {phase === 'running' && `Tur ${rounds.length} — Bakiye: ${bankroll.toFixed(0)}₺ — Bahis: ${currentBet}₺`}
        {phase === 'paused' && `Duraklatıldı — Bakiye: ${bankroll.toFixed(0)}₺ — Bahis: ${currentBet}₺`}
        {phase === 'bankrupt' && <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><AlertTriangle size={18} /> İFLAS! {rounds.length} turda bakiyeniz bitti!</span>}
        {phase === 'target_reached' && `🎉 Hedefe ulaştınız! ${rounds.length} turda +${profit.toFixed(0)}₺ kâr!`}
        {phase === 'max_rounds' && `⏱️ ${maxRounds} tur tamamlandı — ${profit >= 0 ? 'Kâr' : 'Zarar'}: ${profit.toFixed(0)}₺`}
      </div>

      {/* Main area — 3 column layout */}
      <div style={styles.mainArea}>
        {/* Left: Coin + Bet Escalation */}
        <div style={styles.leftPanel} className="glass">
          <RouletteWheel lastResult={lastResult} isFlipping={isFlipping} history={history} />
          <div style={styles.divider} />
          <BetEscalation
            baseBet={baseBet}
            currentStreak={consecutiveLosses}
            currentBet={currentBet}
            bankroll={bankroll}
            winProbability={winProbability}
          />
        </div>

        {/* Right: Chart */}
        <div style={styles.rightPanel} className="glass">
          <BankrollChart
            rounds={rounds}
            initialBankroll={initialBankroll}
            targetProfit={targetProfit}
          />
          {/* Quick stats */}
          <div style={styles.quickStats}>
            <div style={styles.qStat}>
              <span style={styles.qLabel}>Bakiye</span>
              <span style={{ ...styles.qValue, color: profit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                {bankroll.toFixed(0)}₺
              </span>
            </div>
            <div style={styles.qDivider} />
            <div style={styles.qStat}>
              <span style={styles.qLabel}>Turlar</span>
              <span style={styles.qValue}>{rounds.length}</span>
            </div>
            <div style={styles.qDivider} />
            <div style={styles.qStat}>
              <span style={styles.qLabel}>Kazanma</span>
              <span style={{ ...styles.qValue, color: 'var(--color-success)' }}>
                {rounds.filter(r => r.won).length}
              </span>
            </div>
            <div style={styles.qDivider} />
            <div style={styles.qStat}>
              <span style={styles.qLabel}>Maks Bahis</span>
              <span style={{ ...styles.qValue, color: '#f59e0b' }}>
                {rounds.length > 0 ? Math.max(...rounds.map(r => r.bet)).toFixed(0) : baseBet}₺
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Math insight */}
      {rounds.length > 0 && (
        <div style={styles.mathPanel} className="glass animate-fade-in">
          <div style={styles.mathHeader}>
            <Calculator size={24} style={{ color: '#f59e0b' }} />
            <span style={styles.mathTitle}>Martingale Matematiği</span>
          </div>

          <div style={styles.mathStep}>
            <div style={styles.mathStepLabel}>Strateji</div>
            <p style={styles.mathText}>
              Kaybettikçe bahsi ikiye katla, kazanınca <strong>{baseBet}₺</strong>'ye dön.
              Her "kayıp serisi + 1 kazanç" döngüsü net <strong style={{ color: 'var(--color-success)' }}>+{baseBet}₺</strong> kazandırır.
            </p>
          </div>

          <div style={styles.mathStep}>
            <div style={styles.mathStepLabel}>Tuzak</div>
            <p style={styles.mathText}>
              {consecutiveLosses > 0 ? (
                <>
                  Şu an <strong style={{ color: 'var(--color-error)' }}>{consecutiveLosses}</strong> üst üste kayıptasınız.
                  Toplam kaybınız: <strong style={{ color: 'var(--color-error)' }}>{totalLossAfterStreak(baseBet, consecutiveLosses)}₺</strong>.
                  Bir sonraki bahis: <strong style={{ color: '#f59e0b' }}>{betAfterStreak(baseBet, consecutiveLosses)}₺</strong>.
                  Tüm bu risk, sadece <strong style={{ color: 'var(--color-success)' }}>{baseBet}₺</strong> kazanmak için!
                </>
              ) : (
                <>
                  Şu an seri kayıp yok. Ama her an olabilir —
                  adil bir oyunda 10 üst üste kayıp olasılığı <strong>%{(Math.pow(1 - winProbability, 10) * 100).toFixed(2)}</strong>.
                  O zaman bahsiniz <strong>{betAfterStreak(baseBet, 10)}₺</strong> olur!
                </>
              )}
            </p>
          </div>

          {isFinished && (
            <div style={styles.mathStep}>
              <div style={styles.mathStepLabel}>💡 Sonuç</div>
              <p style={styles.mathText}>
                {phase === 'bankrupt' ? (
                  <>
                    Üstel büyüme bakiyenizi yuttu. Martingale'in sorunu budur:
                    küçük kazançlar <strong>sık</strong>, büyük kayıplar <strong>nadir ama yıkıcı</strong>.
                    Uzun vadede beklenen değer her zaman ≤ 0'dır.
                  </>
                ) : phase === 'target_reached' ? (
                  <>
                    Hedefe ulaştınız — ama bu <strong>şanslı bir senaryo</strong>.
                    Yeterince uzun oynarsanız üstel bahis büyümesi er ya da geç bakiyenizi siler.
                    Toplu Simülasyon'da bunu görebilirsiniz!
                  </>
                ) : (
                  <>
                    {maxRounds} tur tamamlandı. {profit >= 0 ? 'Bu sefer kârlı çıktınız' : 'Zarar ettiniz'}.
                    Daha fazla tur oynasaydınız sonuç farklı olabilirdi.
                  </>
                )}
              </p>
            </div>
          )}
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
    padding: 'var(--space-4) var(--space-6)',
  },
  controlRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 'var(--space-4)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playback: {
    display: 'flex',
    gap: 'var(--space-2)',
  },
  speedControl: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  speedIcon: {
    fontSize: 'var(--font-size-base)',
  },
  speedSlider: {
    width: 100,
    height: 4,
    appearance: 'none' as const,
    background: 'var(--color-surface-active)',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
  },
  status: {
    textAlign: 'center' as const,
    fontSize: 'var(--font-size-base)',
    minHeight: 24,
    transition: 'all 300ms ease',
  },
  mainArea: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 'var(--space-4)',
  },
  leftPanel: {
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  rightPanel: {
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  divider: {
    height: 1,
    background: 'var(--color-border)',
  },
  quickStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-3)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
  },
  qStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 2,
  },
  qLabel: {
    fontSize: 8,
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  qValue: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  qDivider: {
    width: 1,
    height: 24,
    background: 'var(--color-border)',
  },
  mathPanel: {
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  mathHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  mathTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  mathStep: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-1)',
  },
  mathStepLabel: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 700,
    color: '#f59e0b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  mathText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
  },
};

export default SingleSession;
