/* ============================================================
   MontyHallPage — Main Page for Monty Hall Paradox
   ============================================================ */

import React, { useState } from 'react';
import { DoorOpen, Gamepad2, BarChart2, Brain, MousePointer2, Eye, RefreshCw } from 'lucide-react';
import SingleGame from './components/SingleGame';
import BulkSimulation from './components/BulkSimulation';

type Mode = 'single' | 'bulk';

const MontyHallPage: React.FC = () => {
  const [numDoors, setNumDoors] = useState(3);
  const [mode, setMode] = useState<Mode>('single');

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.badge}>Olasılık Paradoksu</div>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>
              <DoorOpen size={40} />
            </span>
            Monty Hall Problemi
          </h1>
          <p style={styles.description}>
            Bir TV yarışmasındasınız. 3 kapıdan birinin arkasında araba, diğerlerinin arkasında keçi var.
            Bir kapı seçtikten sonra sunucu keçili bir kapıyı açıyor. Kapınızı değiştirmeli misiniz?
          </p>
        </div>
      </header>

      {/* Mode toggle */}
      <div style={styles.modeToggle}>
        <button
          className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('single')}
          style={{ gap: 'var(--space-2)' }}
        >
          <Gamepad2 size={18} /> Tek Deney
        </button>
        <button
          className={`btn ${mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('bulk')}
          style={{ gap: 'var(--space-2)' }}
        >
          <BarChart2 size={18} /> Toplu Simülasyon
        </button>
      </div>

      {/* Controls */}
      {mode === 'single' ? (
        <>
          <div className="glass" style={styles.bulkDoorControl}>
            <div style={styles.bulkDoorGroup}>
              <label style={styles.bulkLabel}>
                <DoorOpen size={16} /> Kapı Sayısı
              </label>
              <div style={styles.bulkSliderRow}>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={numDoors}
                  onChange={(e) => setNumDoors(Number(e.target.value))}
                  style={styles.slider}
                />
                <span style={styles.bulkSliderValue}>{numDoors}</span>
              </div>
            </div>
          </div>
          <SingleGame
            key={numDoors}
            numDoors={numDoors}
          />
        </>
      ) : (
        <>
          <div className="glass" style={styles.bulkDoorControl}>
            <div style={styles.bulkDoorGroup}>
              <label style={styles.bulkLabel}>
                <DoorOpen size={16} /> Kapı Sayısı
              </label>
              <div style={styles.bulkSliderRow}>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={numDoors}
                  onChange={(e) => setNumDoors(Number(e.target.value))}
                  style={styles.slider}
                />
                <span style={styles.bulkSliderValue}>{numDoors}</span>
              </div>
            </div>
          </div>
          <BulkSimulation numDoors={numDoors} />
        </>
      )}

      {/* Educational section */}
      <section style={styles.education} className="glass">
        <h2 style={styles.eduTitle}>
          <Brain size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Paradoks Neden Çalışır?
        </h2>
        <div style={styles.eduGrid}>
          <div style={styles.eduCard}>
            <div style={styles.eduCardIcon}><MousePointer2 size={32} color="var(--color-accent-light)" /></div>
            <h3 style={styles.eduCardTitle}>İlk Seçim</h3>
            <p style={styles.eduCardText}>
              İlk seçiminizde doğru kapıyı seçme olasılığınız 1/3'tür.
              Yani yanlış seçmiş olma olasılığınız 2/3'tür.
            </p>
          </div>
          <div style={styles.eduCard}>
            <div style={styles.eduCardIcon}><Eye size={32} color="var(--color-accent-light)" /></div>
            <h3 style={styles.eduCardTitle}>Sunucu Bilgi Verir</h3>
            <p style={styles.eduCardText}>
              Sunucu hangi kapının arkasında ne olduğunu bilir ve asla arabayı göstermez.
              Bu bilgi, olasılıkları değiştirir.
            </p>
          </div>
          <div style={styles.eduCard}>
            <div style={styles.eduCardIcon}><RefreshCw size={32} color="var(--color-accent-light)" /></div>
            <h3 style={styles.eduCardTitle}>Değiştirmek Avantajlı</h3>
            <p style={styles.eduCardText}>
              İlk seçiminiz 2/3 olasılıkla yanlışsa ve sunucu bir keçiyi elediyse,
              kalan kapı 2/3 olasılıkla doğrudur!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-8)',
    maxWidth: 960,
    margin: '0 auto',
    padding: 'var(--space-8) var(--space-4)',
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
    display: 'inline-flex',
    padding: 'var(--space-1) var(--space-4)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-accent-light)',
    background: 'var(--color-accent-subtle)',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: 800,
    background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    lineHeight: 1.2,
  },
  titleIcon: {
    WebkitTextFillColor: 'initial',
    fontSize: 'var(--font-size-4xl)',
  },
  description: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-text-secondary)',
    maxWidth: 600,
    lineHeight: 1.7,
  },
  modeToggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-3)',
  },
  bulkDoorControl: {
    padding: 'var(--space-6)',
  },
  bulkDoorGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-3)',
    maxWidth: 400,
  },
  bulkLabel: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  bulkSliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  slider: {
    flex: 1,
    height: 6,
    appearance: 'none' as const,
    background: 'linear-gradient(90deg, var(--color-accent-dark), var(--color-accent-light))',
    borderRadius: 'var(--radius-full)',
    outline: 'none',
    cursor: 'pointer',
  },
  bulkSliderValue: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 800,
    color: 'var(--color-accent-light)',
    minWidth: 40,
    textAlign: 'center' as const,
  },
  education: {
    padding: 'var(--space-8)',
    marginTop: 'var(--space-4)',
  },
  eduTitle: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    marginBottom: 'var(--space-6)',
    textAlign: 'center' as const,
  },
  eduGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'var(--space-6)',
  },
  eduCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
    padding: 'var(--space-5)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
  },
  eduCardIcon: {
    fontSize: 'var(--font-size-2xl)',
    marginBottom: 'var(--space-1)',
  },
  eduCardTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  eduCardText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.7,
  },
};

export default MontyHallPage;
