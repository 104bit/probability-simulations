/* ============================================================
   SingleExperiment — Step-by-Step Birthday Experiment
   ============================================================
   Kişiler sırayla eklenir. Play/Pause/Step/Reset kontrolleri.
   Eşleşme bulunursa animasyon ve açıklama gösterilir.
   ============================================================ */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Pause, Play, StepForward, RefreshCw, Snail, Rabbit, Pointer, 
  PartyPopper, Calculator, Lightbulb, Users, GraduationCap, BarChart2 
} from 'lucide-react';
import PeopleGrid from './PeopleGrid';
import CalendarView from './CalendarView';
import type { Person, ExperimentPhase } from '../types';
import { createPerson, calculateBirthdayProbability } from '../simulation';
import { useSound } from '../../../hooks/useSound';

interface SingleExperimentProps {
  groupSize: number;
  userGuess: number | null;
}

const SingleExperiment: React.FC<SingleExperimentProps> = ({ groupSize, userGuess }) => {
  const { playClick, playPop, playSuccess } = useSound();
  const [phase, setPhase] = useState<ExperimentPhase>('setup');
  const [people, setPeople] = useState<Person[]>([]);
  const [latestId, setLatestId] = useState<number | undefined>(undefined);
  const [matchDay, setMatchDay] = useState<number | null>(null);
  const [matchPair, setMatchPair] = useState<[number, number] | null>(null);
  const [speed, setSpeed] = useState(500); // ms per step
  const intervalRef = useRef<number | null>(null);
  const peopleRef = useRef<Person[]>([]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Sync ref with state
  useEffect(() => {
    peopleRef.current = people;
  }, [people]);

  const addNextPerson = useCallback(() => {
    const currentPeople = peopleRef.current;
    if (currentPeople.length >= groupSize) {
      // Grup tamamlandı, eşleşme yok
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setPhase('complete');
      return;
    }

    const newPerson = createPerson(currentPeople.length);
    const birthdaySet = new Set(currentPeople.map(p => p.birthday));

    if (birthdaySet.has(newPerson.birthday)) {
      // Eşleşme bulundu!
      playSuccess();
      newPerson.isMatch = true;
      const matchWith = currentPeople.find(p => p.birthday === newPerson.birthday)!;

      const updatedPeople = currentPeople.map(p =>
        p.id === matchWith.id ? { ...p, isMatch: true } : p
      );
      updatedPeople.push(newPerson);

      setPeople(updatedPeople);
      peopleRef.current = updatedPeople;
      setLatestId(newPerson.id);
      setMatchDay(newPerson.birthday);
      setMatchPair([matchWith.id, newPerson.id]);
      setPhase('match');

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    playPop();
    const nextPeople = [...currentPeople, newPerson];
    setPeople(nextPeople);
    peopleRef.current = nextPeople;
    setLatestId(newPerson.id);
  }, [groupSize, playSuccess, playPop]);

  // Play: otomatik kişi ekleme
  const play = useCallback(() => {
    if (phase === 'match' || phase === 'complete') return;
    playClick();
    setPhase('running');
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(addNextPerson, speed);
  }, [addNextPerson, speed, phase, playClick]);

  // Speed değiştiğinde interval güncelle
  useEffect(() => {
    if (phase === 'running' && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(addNextPerson, speed);
    }
  }, [speed, phase, addNextPerson]);

  const pause = useCallback(() => {
    playClick();
    setPhase('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [playClick]);

  const step = useCallback(() => {
    if (phase === 'match' || phase === 'complete') return;
    playClick();
    setPhase('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addNextPerson();
  }, [addNextPerson, phase, playClick]);

  const reset = useCallback(() => {
    playClick();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPeople([]);
    peopleRef.current = [];
    setLatestId(undefined);
    setMatchDay(null);
    setMatchPair(null);
    setPhase('setup');
  }, [playClick]);

  const isFinished = phase === 'match' || phase === 'complete';
  const currentProb = calculateBirthdayProbability(people.length);

  return (
    <div style={styles.wrapper}>
      {/* Controls */}
      <div style={styles.controls} className="glass">
        <div style={styles.controlRow}>
          {/* Playback buttons */}
          <div style={styles.playback}>
            {phase === 'running' ? (
              <button className="btn btn-secondary" onClick={pause} title="Duraklat" style={{ gap: 'var(--space-2)' }}>
                <Pause size={16} /> Duraklat
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={play}
                disabled={isFinished}
                title="Başlat"
                style={{ gap: 'var(--space-2)' }}
              >
                <Play size={16} /> {phase === 'setup' ? 'Başlat' : 'Devam'}
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={step}
              disabled={isFinished}
              title="Bir kişi ekle"
              style={{ gap: 'var(--space-2)' }}
            >
              <StepForward size={16} /> Adım
            </button>
            <button className="btn btn-secondary" onClick={reset} title="Sıfırla" style={{ gap: 'var(--space-2)' }}>
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>

          {/* Speed control */}
          <div style={styles.speedControl}>
            <label style={styles.speedLabel}><Snail size={18} color="var(--color-text-muted)" /></label>
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              value={1050 - speed}
              onChange={(e) => {
                setSpeed(1050 - Number(e.target.value));
              }}
              onMouseUp={() => playClick()}
              style={styles.speedSlider}
            />
            <label style={styles.speedLabel}><Rabbit size={18} color="var(--color-text-secondary)" /></label>
          </div>
        </div>

        {/* Progress bar */}
        <div style={styles.progressRow}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(people.length / groupSize) * 100}%`,
                background: isFinished && phase === 'match'
                  ? 'linear-gradient(90deg, #ec4899, #f43f5e)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
            />
          </div>
          <span style={styles.progressText}>
            {people.length} / {groupSize} kişi
          </span>
        </div>
      </div>

      {/* Status */}
      <div style={{
        ...styles.status,
        color: phase === 'match' ? '#f43f5e' : phase === 'complete' ? 'var(--color-success)' : 'var(--color-text-secondary)',
        fontWeight: isFinished ? 700 : 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        {phase === 'setup' && <><Pointer size={18} /> Başlat butonuna tıklayın veya adım adım ilerleyin</>}
        {phase === 'running' && `Kişi #${people.length} eklendi...`}
        {phase === 'paused' && `Duraklatıldı — ${people.length} kişi eklendi`}
        {phase === 'match' && matchPair && <><PartyPopper size={18} /> Eşleşme! Kişi #{matchPair[0] + 1} ve #{matchPair[1] + 1} aynı doğum gününe sahip!</>}
        {phase === 'complete' && `${groupSize} kişi eklendi — eşleşme bulunamadı!`}
      </div>

      {/* ============================================================
         CANLI MATEMATİK AÇIKLAMA PANELİ
         ============================================================ */}
      {people.length > 0 && (
        <div style={styles.mathPanel} className="glass animate-fade-in">
          <div style={styles.mathHeader}>
            <span style={styles.mathEmoji}><Calculator size={24} color="#ec4899" /></span>
            <span style={styles.mathTitle}>Olasılık Nasıl Hesaplanır?</span>
          </div>

          {/* Adım 1: Tamamlayıcı yaklaşım */}
          <div style={styles.mathStep}>
            <div style={styles.mathStepLabel}>Mantık</div>
            <p style={styles.mathText}>
              Direkt "<em>eşleşme olasılığı</em>" hesaplamak zor. Bunun yerine{' '}
              <strong style={{ color: '#ec4899' }}>tersten</strong> düşünürüz:
            </p>
            <div style={styles.mathFormula}>
              P(eşleşme) = 1 − P(hiç kimse aynı güne denk gelmez)
            </div>
          </div>

          {/* Adım 2: Canlı formül zinciri */}
          <div style={styles.mathStep}>
            <div style={styles.mathStepLabel}>Formül ({people.length} kişi için)</div>
            <p style={styles.mathText}>
              Yılda 365 gün var. Her yeni kişi, önceki kişilerle <strong>çakışmamalı</strong>:
            </p>
            <div style={styles.fractionChain}>
              <span style={styles.fractionLabel}>P(çakışma yok) = </span>
              {people.length <= 8 ? (
                // 8 kişiye kadar tüm kesirleri göster
                Array.from({ length: people.length }, (_, i) => (
                  <span key={i} style={styles.fractionGroup}>
                    {i > 0 && <span style={styles.fractionOp}>×</span>}
                    <span style={{
                      ...styles.fraction,
                      color: i === people.length - 1 ? '#ec4899' : 'var(--color-text-secondary)',
                      fontWeight: i === people.length - 1 ? 700 : 400,
                    }}>
                      <span style={styles.fractionNum}>{365 - i}</span>
                      <span style={styles.fractionBar} />
                      <span style={styles.fractionDen}>365</span>
                    </span>
                  </span>
                ))
              ) : (
                // 8'den fazlaysa kısalt
                <>
                  <span style={styles.fractionGroup}>
                    <span style={styles.fraction}>
                      <span style={styles.fractionNum}>365</span>
                      <span style={styles.fractionBar} />
                      <span style={styles.fractionDen}>365</span>
                    </span>
                  </span>
                  <span style={styles.fractionOp}>×</span>
                  <span style={styles.fractionGroup}>
                    <span style={styles.fraction}>
                      <span style={styles.fractionNum}>364</span>
                      <span style={styles.fractionBar} />
                      <span style={styles.fractionDen}>365</span>
                    </span>
                  </span>
                  <span style={styles.fractionOp}>×</span>
                  <span style={{...styles.fractionOp, letterSpacing: 2 }}>···</span>
                  <span style={styles.fractionOp}>×</span>
                  <span style={styles.fractionGroup}>
                    <span style={{ ...styles.fraction, color: '#ec4899', fontWeight: 700 }}>
                      <span style={styles.fractionNum}>{365 - people.length + 1}</span>
                      <span style={styles.fractionBar} />
                      <span style={styles.fractionDen}>365</span>
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Adım 3: Sonuç */}
          <div style={styles.mathStep}>
            <div style={styles.mathStepLabel}>Sonuç</div>
            <div style={styles.mathResultRow}>
              <div style={styles.mathResultCard}>
                <div style={styles.mathResultLabel}>P(çakışma yok)</div>
                <div style={{ ...styles.mathResultValue, color: 'var(--color-text-muted)' }}>
                  %{((1 - currentProb) * 100).toFixed(1)}
                </div>
              </div>
              <div style={styles.mathResultArrow}>→</div>
              <div style={styles.mathResultCard}>
                <div style={styles.mathResultLabel}>1 − {((1 - currentProb)).toFixed(4)}</div>
                <div style={{ ...styles.mathResultValue, color: '#ec4899' }}>
                  = %{(currentProb * 100).toFixed(1)}
                </div>
              </div>
              <div style={styles.mathResultCard}>
                <div style={styles.mathResultLabel}>Eşleşme olasılığı</div>
                <div style={{
                  ...styles.mathResultBig,
                  color: currentProb >= 0.5 ? '#f43f5e' : '#ec4899',
                }}>
                  %{(currentProb * 100).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Adım 4: Sezgisel açıklama */}
          <div style={styles.mathStep}>
            <div style={styles.mathStepLabel}>
              <Lightbulb size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} color="#ec4899" /> Neden yüksek?
            </div>
            <p style={styles.mathText}>
              <strong style={{ color: 'var(--color-accent-light)' }}>{people.length}</strong> kişide{' '}
              <strong style={{ color: '#ec4899' }}>{people.length * (people.length - 1) / 2}</strong> farklı ikili var.
              Doğum gününüzün sadece <em>bir kişiyle</em> eşleşmesini değil,{' '}
              <em>herhangi iki kişinin</em> eşleşmesini arıyoruz.
              {people.length >= 23 && (
                <span style={{ color: '#f43f5e', fontWeight: 600 }}>
                  {' '}23 kişide 253 ikili = %50'yi geçer!
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main visual area — People + Calendar side by side */}
      <div style={styles.mainArea}>
        <div style={styles.peopleSection} className="glass">
          <div style={styles.sectionTitle}>
            <Users size={16} /> Grup ({people.length} kişi)
          </div>
          <PeopleGrid people={people} latestId={latestId} />
        </div>
        <div style={styles.calendarSection} className="glass">
          <CalendarView people={people} matchDay={matchDay} />
        </div>
      </div>

      {/* Match insight */}
      {phase === 'match' && matchPair && (
        <div style={styles.matchInsight} className="animate-fade-in glass">
          <div style={styles.insightHeader}>
            <GraduationCap size={24} color="#ec4899" />
            <span style={styles.insightTitle}>Ne oldu?</span>
          </div>
          <p style={styles.insightText}>
            <strong style={{ color: '#ec4899' }}>{people.length}</strong> kişilik grupta eşleşme bulundu!
            {' '}Bu grup boyutunda teorik eşleşme olasılığı{' '}
            <strong style={{ color: '#ec4899' }}>%{(currentProb * 100).toFixed(1)}</strong> idi.
          </p>
          {userGuess !== null && (
            <p style={styles.insightText}>
              Tahmininiz <strong style={{ color: 'var(--color-accent-light)' }}>{userGuess} kişi</strong> idi.
              Gerçek %50 eşiği ise sadece <strong style={{ color: '#ec4899' }}>23 kişi</strong>!
              {userGuess > 30
                ? ' Çoğu insan gibi siz de olasılığı düşük tahmin ettiniz — bu yüzden buna "paradoks" deniyor!'
                : userGuess <= 25
                ? ' Harika sezgi! Çoğu insan çok daha yüksek tahmin eder.'
                : ' İyi tahmin! Doğru cevaba çok yaklaştınız.'}
            </p>
          )}
          <p style={styles.insightText}>
            <Lightbulb size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} color="#ec4899" /> Neden bu kadar düşük? Çünkü karşılaştırma sayısı hızla artar:
            23 kişide <strong>{23 * 22 / 2} = {23 * 22 / 2}</strong> farklı ikili karşılaştırma yapılır!
          </p>
        </div>
      )}

      {phase === 'complete' && (
        <div style={styles.matchInsight} className="animate-fade-in glass">
          <div style={styles.insightHeader}>
            <BarChart2 size={24} color="#ec4899" />
            <span style={styles.insightTitle}>Sonuç</span>
          </div>
          <p style={styles.insightText}>
            Bu denemede {groupSize} kişi arasında eşleşme bulunamadı.
            Ancak teorik olasılık <strong style={{ color: '#ec4899' }}>%{(currentProb * 100).toFixed(1)}</strong> idi — yani {
              currentProb > 0.5 ? 'eşleşme bulunma olasılığı daha yüksekti, bu sefer şanssız bir deneme oldu!' : 'bu boyutta eşleşme bulmamak normal.'
            }
          </p>
          <p style={styles.insightText}>
            ⚡ Toplu Simülasyon modunda binlerce deneyle gerçek oranları görebilirsiniz.
          </p>
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
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
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
  speedLabel: {
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
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: 'var(--color-surface-active)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
    transition: 'width 200ms ease',
  },
  progressText: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap' as const,
    minWidth: 80,
    textAlign: 'right' as const,
  },
  status: {
    textAlign: 'center' as const,
    fontSize: 'var(--font-size-base)',
    minHeight: 24,
    transition: 'all 300ms ease',
  },
  mainArea: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 'var(--space-4)',
    minHeight: 200,
  },
  peopleSection: {
    padding: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-3)',
  },
  calendarSection: {
    padding: 'var(--space-4)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  matchInsight: {
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-3)',
  },
  insightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--font-size-base)',
  },
  insightTitle: {
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  insightText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
  },
  // Math panel styles
  mathPanel: {
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-5)',
  },
  mathHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  mathEmoji: {
    fontSize: 'var(--font-size-xl)',
  },
  mathTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  mathStep: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  mathStepLabel: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 700,
    color: '#ec4899',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  mathText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
  },
  mathFormula: {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text)',
    fontWeight: 600,
    background: 'rgba(236, 72, 153, 0.06)',
    border: '1px solid rgba(236, 72, 153, 0.15)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3) var(--space-4)',
    textAlign: 'center' as const,
  },
  fractionChain: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-3) 0',
  },
  fractionLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    fontWeight: 600,
    marginRight: 'var(--space-1)',
  },
  fractionGroup: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  fractionOp: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    padding: '0 2px',
  },
  fraction: {
    display: 'inline-flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    fontSize: 12,
    lineHeight: 1.1,
    transition: 'all 300ms ease',
  },
  fractionNum: {
    // numerator
  },
  fractionBar: {
    width: '100%',
    height: 1,
    background: 'var(--color-text-muted)',
    margin: '1px 0',
  },
  fractionDen: {
    // denominator
  },
  mathResultRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  mathResultCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 2,
    padding: 'var(--space-2) var(--space-4)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
  },
  mathResultLabel: {
    fontSize: 9,
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },
  mathResultValue: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
  },
  mathResultBig: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 800,
  },
  mathResultArrow: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-text-muted)',
  },
};

export default SingleExperiment;
