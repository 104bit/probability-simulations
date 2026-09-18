/* ============================================================
   SingleGame — Step-by-Step Interactive Single Trial Mode
   ============================================================
   Kullanıcı her aşamayı kendisi ilerletir.
   Strateji kararı, sunucu kapıyı açtıktan SONRA verilir.
   
   Akış:
   1. setup     → Kullanıcı kapı seçer (tıklayarak)
   2. selected  → "Devam" → Sunucu keçili kapıyı açar
   3. revealed  → "Kalıyorum" veya "Değiştiriyorum" seçer
   4. decided   → "Sonucu Göster" → Tüm kapılar açılır
   5. result    → "Tekrar Oyna"
   
   X-ray modu ile kapıların arkası her zaman görülebilir.
   ============================================================ */

import React, { useState, useCallback } from 'react';
import { 
  ArrowRight, Home, RefreshCw, Pointer, Trophy, Frown, 
  Calculator, GraduationCap, Ruler, CheckCircle2, XCircle, 
  Target, Clover, Zap, Search, Eye, Map as MapIcon, Lightbulb
} from 'lucide-react';
import DoorsStage from './DoorsStage';
import type { GamePhase, DoorInfo, DoorState, Strategy } from '../types';
import { useSound } from '../../../hooks/useSound';

interface SingleGameProps {
  numDoors: number;
}

const SingleGame: React.FC<SingleGameProps> = ({ numDoors }) => {
  const { playClick, playPop, playSuccess, playError } = useSound();
  const [prizeDoor, setPrizeDoor] = useState(() => Math.floor(Math.random() * numDoors));
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [doors, setDoors] = useState<DoorInfo[]>(
    () => Array.from({ length: numDoors }, (_, i) => ({
      index: i,
      hasPrize: i === prizeDoor,
      state: 'closed' as DoorState,
    }))
  );
  const [stateOverrides, setStateOverrides] = useState<Map<number, DoorState>>(new Map());
  const [playerChoice, setPlayerChoice] = useState<number | null>(null);
  const [revealedDoor, setRevealedDoor] = useState<number | null>(null);
  const [finalChoice, setFinalChoice] = useState<number | null>(null);
  const [chosenStrategy, setChosenStrategy] = useState<Strategy | null>(null);
  const [won, setWon] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, total: 0 });
  const [xray, setXray] = useState(false);

  // prizeDoor değişince kapıları güncelle (setup'ta)
  React.useEffect(() => {
    if (phase === 'setup') {
      setDoors(Array.from({ length: numDoors }, (_, i) => ({
        index: i,
        hasPrize: i === prizeDoor,
        state: 'closed' as DoorState,
      })));
    }
  }, [prizeDoor, numDoors, phase]);

  // ============================================================
  // ADIM 1: Kullanıcı kapıya tıklar → selecting
  // ============================================================
  const handleDoorClick = useCallback((doorIndex: number) => {
    if (phase !== 'setup') return;

    playClick();
    setPlayerChoice(doorIndex);

    const overrides = new Map<number, DoorState>();
    for (let i = 0; i < numDoors; i++) overrides.set(i, 'closed');
    overrides.set(doorIndex, 'selected');
    setStateOverrides(overrides);
    setPhase('selecting');
  }, [numDoors, phase, playClick]);

  // ============================================================
  // ADIM 2: Devam → Sunucu kapıyı açar → revealing
  // ============================================================
  const advanceToRevealing = useCallback(() => {
    if (playerChoice === null) return;

    playPop();
    // Sunucu: oyuncunun seçmediği VE araba olmayan kapılardan birini aç
    const revealable: number[] = [];
    for (let i = 0; i < numDoors; i++) {
      if (i !== playerChoice && i !== prizeDoor) {
        revealable.push(i);
      }
    }
    const revealed = revealable[Math.floor(Math.random() * revealable.length)];
    setRevealedDoor(revealed);

    const overrides = new Map(stateOverrides);
    overrides.set(revealed, 'revealed');
    setStateOverrides(overrides);
    setPhase('revealing');
  }, [playerChoice, prizeDoor, numDoors, stateOverrides, playPop]);

  // ============================================================
  // ADIM 3: Kullanıcı strateji seçer → deciding
  // ============================================================
  const chooseStrategy = useCallback((strategy: Strategy) => {
    if (playerChoice === null || revealedDoor === null) return;

    playClick();
    setChosenStrategy(strategy);

    let final: number;
    if (strategy === 'stay') {
      final = playerChoice;
    } else {
      // Değiştir: kalan kapılardan birini seç
      const remaining: number[] = [];
      for (let i = 0; i < numDoors; i++) {
        if (i !== playerChoice && i !== revealedDoor) {
          remaining.push(i);
        }
      }
      final = remaining[Math.floor(Math.random() * remaining.length)];
    }
    setFinalChoice(final);

    const overrides = new Map(stateOverrides);
    if (strategy === 'switch') {
      overrides.set(playerChoice, 'unselected');
      overrides.set(final, 'selected');
    }
    setStateOverrides(overrides);
    setPhase('deciding');
  }, [playerChoice, revealedDoor, numDoors, stateOverrides, playClick]);

  // ============================================================
  // ADIM 4: Sonucu göster → result
  // ============================================================
  const advanceToResult = useCallback(() => {
    if (finalChoice === null) return;

    const didWin = finalChoice === prizeDoor;
    if (didWin) playSuccess();
    else playError();

    // Tüm kapıları aç
    const overrides = new Map<number, DoorState>();
    for (let i = 0; i < numDoors; i++) {
      if (i === finalChoice) {
        overrides.set(i, didWin ? 'won' : 'lost');
      } else {
        overrides.set(i, 'revealed');
      }
    }

    // Doors'u güncelle (hasPrize bilgisi doğru olsun)
    setDoors(Array.from({ length: numDoors }, (_, i) => ({
      index: i,
      hasPrize: i === prizeDoor,
      state: 'closed' as DoorState,
    })));

    setStateOverrides(overrides);
    setWon(didWin);
    setPhase('result');

    setStats(prev => ({
      wins: prev.wins + (didWin ? 1 : 0),
      losses: prev.losses + (didWin ? 0 : 1),
      total: prev.total + 1,
    }));
  }, [finalChoice, prizeDoor, numDoors, playSuccess, playError]);

  // ============================================================
  // Tekrar oyna
  // ============================================================
  const resetGame = useCallback(() => {
    playClick();
    const newPrize = Math.floor(Math.random() * numDoors);
    setPrizeDoor(newPrize);
    setPhase('setup');
    setPlayerChoice(null);
    setRevealedDoor(null);
    setFinalChoice(null);
    setChosenStrategy(null);
    setDoors(
      Array.from({ length: numDoors }, (_, i) => ({
        index: i,
        hasPrize: i === newPrize,
        state: 'closed' as DoorState,
      }))
    );
    setStateOverrides(new Map());
    setWon(false);
  }, [numDoors, playClick]);

  // ============================================================
  // Render
  // ============================================================
  const allPhases: GamePhase[] = ['setup', 'selecting', 'revealing', 'deciding', 'result'];
  const phaseNames = ['Seçim', 'Seçildi', 'Karar', 'Strateji', 'Sonuç'];
  const currentIdx = allPhases.indexOf(phase);

  // Status message
  const getMessage = () => {
    switch (phase) {
      case 'setup': return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Pointer size={20} /> Bir kapı seçin!</span>;
      case 'selecting': return `Kapı ${(playerChoice ?? 0) + 1} seçildi!`;
      case 'revealing': return `Sunucu Kapı ${(revealedDoor ?? 0) + 1}'i açtı — keçi! Şimdi ne yapacaksınız?`;
      case 'deciding': return chosenStrategy === 'stay'
        ? `Kapı ${(finalChoice ?? 0) + 1}'de kalıyorsunuz...`
        : `Kapı ${(finalChoice ?? 0) + 1}'e geçtiniz!`;
      case 'result': return won ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Trophy size={20} /> Tebrikler! Arabayı kazandınız!</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Frown size={20} /> Keçiyi buldunuz! Bu sefer olmadı.</span>;
    }
  };

  const getMessageColor = () => {
    switch (phase) {
      case 'setup': return 'var(--color-accent-light)';
      case 'selecting': return 'var(--color-accent-light)';
      case 'revealing': return '#fb923c';
      case 'deciding': return 'var(--color-accent-light)';
      case 'result': return won ? 'var(--color-success)' : 'var(--color-error)';
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Phase indicator */}
      <div style={styles.phaseBar}>
        <div style={styles.phases}>
          {allPhases.map((p, i) => {
            const isActive = phase === p;
            const isPast = currentIdx > i;
            return (
              <React.Fragment key={p}>
                {i > 0 && (
                  <div style={{
                    ...styles.phaseLine,
                    background: isPast ? 'var(--color-accent)' : 'var(--color-surface-active)',
                  }} />
                )}
                <div style={{
                  ...styles.phaseStep,
                  background: isActive
                    ? 'var(--color-accent)'
                    : isPast
                    ? 'var(--color-accent-dark)'
                    : 'var(--color-surface-active)',
                  color: isActive || isPast ? 'white' : 'var(--color-text-muted)',
                  boxShadow: isActive ? 'var(--shadow-glow-accent)' : 'none',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}>
                  {phaseNames[i]}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      <div style={{
        ...styles.statusMessage,
        color: getMessageColor(),
        fontWeight: phase === 'result' || phase === 'setup' || phase === 'revealing' ? 700 : 500,
        fontSize: phase === 'setup' || phase === 'revealing' ? 'var(--font-size-xl)' : 'var(--font-size-lg)',
      }}>
        {getMessage()}
      </div>

      {/* Contextual educational insight */}
      {phase !== 'setup' && (
        <div style={styles.insightBox} className="animate-fade-in glass">
          <div style={styles.insightHeader}>
            <span style={styles.insightEmoji}>
              {phase === 'selecting' && <Calculator size={20} />}
              {phase === 'revealing' && <GraduationCap size={20} />}
              {phase === 'deciding' && <Ruler size={20} />}
              {phase === 'result' && (won ? <CheckCircle2 size={20} color="var(--color-success)" /> : <XCircle size={20} color="var(--color-error)" />)}
            </span>
            <span style={styles.insightLabel}>
              {phase === 'selecting' && 'Olasılık Nedir?'}
              {phase === 'revealing' && 'Kritik An!'}
              {phase === 'deciding' && 'Ne Oldu?'}
              {phase === 'result' && 'Sonuç Analizi'}
            </span>
          </div>
          <div style={styles.insightBody}>
            {phase === 'selecting' && (
              <>
                <p style={styles.insightText}>
                  <strong style={{ color: 'var(--color-accent-light)' }}>{numDoors} kapı</strong> var ve sadece <strong style={{ color: 'var(--color-success)' }}>1 araba</strong>.
                  İlk seçiminizde arabayı bulma olasılığınız{' '}
                  <strong style={{ color: 'var(--color-warning)' }}>1/{numDoors} = %{(100 / numDoors).toFixed(1)}</strong>.
                </p>
                <p style={styles.insightText}>
                  Yani <strong style={{ color: 'var(--color-error)' }}>%{(100 - 100 / numDoors).toFixed(1)}</strong> olasılıkla keçi seçtiniz!
                  Bu bilgi birazdan çok işinize yarayacak...
                </p>
              </>
            )}
            {phase === 'revealing' && (
              <>
                <p style={styles.insightText}>
                  Sunucu <strong>hangi kapının arkasında ne olduğunu bilir</strong> ve her zaman keçili bir kapıyı açar.
                  Bu rastgele bir hareket değil — bilinçli bir seçim!
                </p>
                <p style={styles.insightText}>
                  Şimdi düşünün: İlk seçiminizde <strong style={{ color: 'var(--color-error)' }}>%{(100 - 100 / numDoors).toFixed(1)}</strong> olasılıkla
                  keçi seçtiniz. Eğer keçi seçtiyseniz ve sunucu diğer keçi{numDoors > 3 ? 'lerden birini' : 'yi'} elediyse,
                  <strong style={{ color: 'var(--color-success)' }}> kalan kapı{numDoors > 3 ? 'lardan biri' : ''} arabadır!</strong>
                </p>
                <p style={{...styles.insightText, ...styles.insightHighlight}}>
                  <Lightbulb size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Değiştirirseniz: İlk seçiminiz yanlışsa (ki %{(100 - 100 / numDoors).toFixed(1)} olasılıkla öyle) → kazanırsınız.
                  Kalırsanız: İlk seçiminiz doğruysa (sadece %{(100 / numDoors).toFixed(1)}) → kazanırsınız.
                </p>
              </>
            )}
            {phase === 'deciding' && chosenStrategy === 'stay' && (
              <>
                <p style={styles.insightText}>
                  Kapınızda kaldınız. Kazanmanız için <strong>ilk seçiminizin doğru olması</strong> gerekiyor.
                </p>
                <p style={{...styles.insightText, ...styles.insightHighlight}}>
                  📊 İlk seçimde doğru kapıyı seçme olasılığınız <strong style={{ color: 'var(--color-warning)' }}>1/{numDoors} = %{(100 / numDoors).toFixed(1)}</strong> idi.
                  Bu olasılık değişmedi — sunucunun kapı açması sizin şansınızı etkilemedi.
                </p>
              </>
            )}
            {phase === 'deciding' && chosenStrategy === 'switch' && (
              <>
                <p style={styles.insightText}>
                  Kapınızı değiştirdiniz! Kazanmanız için <strong>ilk seçiminizin yanlış olması</strong> yeterli.
                </p>
                <p style={{...styles.insightText, ...styles.insightHighlight}}>
                  📊 İlk seçimde yanlış kapıyı seçme olasılığınız <strong style={{ color: 'var(--color-success)' }}>{numDoors - 1}/{numDoors} = %{((numDoors - 1) / numDoors * 100).toFixed(1)}</strong> idi.
                  Sunucu keçiyi elediği için, yanlış seçmiş olmanız avantaja dönüştü!
                </p>
              </>
            )}
            {phase === 'result' && (
              <>
                {won && chosenStrategy === 'switch' && (
                  <p style={styles.insightText}>
                    <Target size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} color="var(--color-success)" /> Değiştirdiniz ve kazandınız! İlk seçiminiz keçiydi, sunucu diğer keçiyi eledi,
                    siz de arabaya geçtiniz. Bu <strong style={{ color: 'var(--color-success)' }}>%{((numDoors - 1) / numDoors * 100).toFixed(1)}</strong> olasılıklı senaryoydu.
                  </p>
                )}
                {won && chosenStrategy === 'stay' && (
                  <p style={styles.insightText}>
                    <Clover size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} color="var(--color-warning)" /> Kaldınız ve kazandınız! İlk seçiminiz zaten arabayı bulmuştu.
                    Ama bu sadece <strong style={{ color: 'var(--color-warning)' }}>%{(100 / numDoors).toFixed(1)}</strong> olasılıklı şanslı senaryoydu.
                  </p>
                )}
                {!won && chosenStrategy === 'switch' && (
                  <p style={styles.insightText}>
                    İlk seçiminiz zaten arabayı bulmuştu ama değiştirdiniz.
                    Bu <strong style={{ color: 'var(--color-warning)' }}>%{(100 / numDoors).toFixed(1)}</strong> olasılıklı nadir senaryoydu — uzun vadede değiştirmek hâlâ daha iyi!
                  </p>
                )}
                {!won && chosenStrategy === 'stay' && (
                  <p style={styles.insightText}>
                    Kaldınız ama ilk seçiminiz keçiydi.
                    Bu <strong style={{ color: 'var(--color-error)' }}>%{((numDoors - 1) / numDoors * 100).toFixed(1)}</strong> olasılıklı beklenen senaryoydu — değiştirmeniz daha avantajlı olurdu!
                  </p>
                )}
                <p style={{...styles.insightText, fontStyle: 'italic', marginTop: 8}}>
                  <Zap size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} color="#f59e0b" /> Uzun vadede değiştirme stratejisi her zaman daha iyi sonuç verir. Toplu Simülasyon modunu deneyin!
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* X-ray toggle */}
      <div style={styles.xrayToggle}>
        <button
          onClick={() => {
            playClick();
            setXray(x => !x);
          }}
          style={{
            ...styles.xrayBtn,
            background: xray
              ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(34, 211, 238, 0.05) 100%)'
              : 'var(--color-surface)',
            borderColor: xray ? '#22d3ee' : 'var(--color-border)',
            color: xray ? '#22d3ee' : 'var(--color-text-muted)',
            boxShadow: xray ? '0 0 16px rgba(34, 211, 238, 0.15)' : 'none',
          }}
        >
          {xray ? <Search size={18} /> : <Eye size={18} />}
          <span>X-Ray {xray ? 'Açık' : 'Kapalı'}</span>
        </button>
        {xray && (
          <span style={styles.xrayHint}>Kapıların arkasını görebilirsiniz!</span>
        )}
      </div>

      {/* Doors */}
      <DoorsStage
        doors={doors}
        overrideStates={stateOverrides.size > 0 ? stateOverrides : undefined}
        onDoorClick={phase === 'setup' ? handleDoorClick : undefined}
        xray={xray}
        doorSize={numDoors <= 5 ? 140 : numDoors <= 7 ? 110 : 90}
      />

      {/* Action buttons — context-dependent */}
      <div style={styles.actions}>
        {/* Seçildi → Sunucu açsın */}
        {phase === 'selecting' && (
          <button className="btn btn-primary btn-lg animate-fade-in" onClick={advanceToRevealing} style={{ gap: 'var(--space-2)' }}>
            Sunucu Kapı Açsın <ArrowRight size={18} />
          </button>
        )}

        {/* Revealed → Strateji seçimi (KAL / DEĞİŞTİR) */}
        {phase === 'revealing' && (
          <div style={styles.strategyChoice} className="animate-fade-in">
            <button
              className="btn btn-lg"
              style={{...styles.stayBtn, gap: 'var(--space-2)'}}
              onClick={() => chooseStrategy('stay')}
            >
              <Home size={18} /> Kapımda Kalıyorum
            </button>
            <span style={styles.strategyOr}>veya</span>
            <button
              className="btn btn-lg"
              style={{...styles.switchBtn, gap: 'var(--space-2)'}}
              onClick={() => chooseStrategy('switch')}
            >
              <RefreshCw size={18} /> Kapımı Değiştiriyorum
            </button>
          </div>
        )}

        {/* Decided → Sonucu göster */}
        {phase === 'deciding' && (
          <button className="btn btn-primary btn-lg animate-fade-in" onClick={advanceToResult} style={{ gap: 'var(--space-2)' }}>
            <Target size={18} /> Sonucu Göster
          </button>
        )}

        {/* Result → Tekrar oyna */}
        {phase === 'result' && (
          <button
            className={`btn ${won ? 'btn-success' : 'btn-primary'} btn-lg animate-fade-in`}
            onClick={resetGame}
            style={{ gap: 'var(--space-2)' }}
          >
            <RefreshCw size={18} /> Tekrar Oyna
          </button>
        )}
      </div>

      {/* Sonuçta detaylı bilgi */}
      {phase === 'result' && (
        <div style={styles.revealInfo} className="animate-fade-in glass">
          <div style={styles.revealIcon}><MapIcon size={32} color="var(--color-accent-light)" /></div>
          <div>
            <div style={styles.revealTitle}>Kapıların Arkası</div>
            <div style={styles.revealDetail}>
              Araba <strong style={{ color: 'var(--color-success)' }}>Kapı {prizeDoor + 1}</strong>'in arkasındaydı.
              {' '}İlk seçiminiz <strong style={{ color: 'var(--color-accent-light)' }}>Kapı {(playerChoice ?? 0) + 1}</strong>,
              {' '}son seçiminiz <strong style={{ color: won ? 'var(--color-success)' : 'var(--color-error)' }}>Kapı {(finalChoice ?? 0) + 1}</strong> oldu.
              {chosenStrategy === 'switch' && (
                <span> Kapınızı değiştirdiniz.</span>
              )}
              {chosenStrategy === 'stay' && (
                <span> Kapınızda kaldınız.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini stats */}
      {stats.total > 0 && (
        <div style={styles.miniStats} className="animate-fade-in">
          <div style={styles.miniStatItem}>
            <span style={styles.miniStatLabel}>Toplam</span>
            <span style={styles.miniStatValue}>{stats.total}</span>
          </div>
          <div style={styles.miniStatDivider} />
          <div style={styles.miniStatItem}>
            <span style={styles.miniStatLabel}>Kazanma</span>
            <span style={{ ...styles.miniStatValue, color: 'var(--color-success)' }}>{stats.wins}</span>
          </div>
          <div style={styles.miniStatDivider} />
          <div style={styles.miniStatItem}>
            <span style={styles.miniStatLabel}>Kaybetme</span>
            <span style={{ ...styles.miniStatValue, color: 'var(--color-error)' }}>{stats.losses}</span>
          </div>
          <div style={styles.miniStatDivider} />
          <div style={styles.miniStatItem}>
            <span style={styles.miniStatLabel}>Oran</span>
            <span style={{ ...styles.miniStatValue, color: 'var(--color-accent-light)' }}>
              %{(stats.wins / stats.total * 100).toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-6)',
  },
  phaseBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-4) 0',
  },
  phases: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
  },
  phaseStep: {
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    transition: 'all 400ms ease',
    whiteSpace: 'nowrap' as const,
  },
  phaseLine: {
    width: 24,
    height: 2,
    borderRadius: 'var(--radius-full)',
    transition: 'background 400ms ease',
  },
  statusMessage: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textAlign: 'center' as const,
    minHeight: '28px',
    transition: 'all 300ms ease',
  },
  insightBox: {
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-3)',
    maxWidth: 600,
    width: '100%',
  },
  insightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  insightEmoji: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  insightLabel: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  insightBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  insightText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    margin: 0,
  },
  insightHighlight: {
    padding: 'var(--space-3)',
    background: 'var(--color-surface-active)',
    borderRadius: 'var(--radius-md)',
    marginTop: 'var(--space-2)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-2) 0',
    minHeight: 56,
  },
  strategyChoice: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  stayBtn: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
    border: 'none',
  },
  switchBtn: {
    background: 'linear-gradient(135deg, var(--color-accent) 0%, #8b5cf6 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    border: 'none',
  },
  strategyOr: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },
  revealInfo: {
    display: 'flex',
    gap: 'var(--space-4)',
    alignItems: 'flex-start',
    padding: 'var(--space-5) var(--space-6)',
    maxWidth: 600,
  },
  revealIcon: {
    fontSize: 'var(--font-size-2xl)',
    lineHeight: 1,
    flexShrink: 0,
  },
  revealTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 4,
  },
  revealDetail: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
  },
  miniStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-3) var(--space-6)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--color-border)',
  },
  miniStatItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 2,
  },
  miniStatLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontWeight: 500,
  },
  miniStatValue: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  miniStatDivider: {
    width: 1,
    height: 28,
    background: 'var(--color-border)',
  },
  xrayToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  xrayBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 300ms ease',
  },
  xrayHint: {
    fontSize: 'var(--font-size-xs)',
    color: '#22d3ee',
    fontWeight: 500,
    animation: 'fadeIn 300ms ease-out',
  },
};

export default SingleGame;
