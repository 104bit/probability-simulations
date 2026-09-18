/* ============================================================
   HomePage — Landing page with paradox grid
   ============================================================ */

import React from 'react';
import { Infinity, Box, BarChart3, Lock } from 'lucide-react';
import ParadoxCard from './ParadoxCard';
import registry from '../paradoxes/registry';

interface HomePageProps {
  onSelectParadox: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelectParadox }) => {
  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            <span style={styles.heroIcon}>
              <Infinity size={48} strokeWidth={2.5} />
            </span>
            <span>Paradoxes</span>
          </h1>
          <p style={styles.heroSubtitle}>
            İnteraktif Olasılık Paradoksları Simülatörü
          </p>
          <p style={styles.heroDescription}>
            Olasılık teorisinin en şaşırtıcı sonuçlarını görsel simülasyonlarla keşfedin.
            Her paradoks, sezgilerimizin neden yanıldığını interaktif deneylerle gösterir.
          </p>
        </div>
      </div>

      <div style={styles.grid} className="stagger-children">
        {registry.map((paradox) => (
          <ParadoxCard
            key={paradox.id}
            paradox={paradox}
            onClick={() => onSelectParadox(paradox.id)}
          />
        ))}
      </div>

      {/* Upcoming section */}
      <div style={styles.upcoming} className="glass">
        <h2 style={styles.upcomingTitle}>🔮 Yakında Gelecek</h2>
        <div style={styles.upcomingGrid}>
          {[
            { icon: <Box size={24} />, name: 'Bertrand Kutu Paradoksu', desc: 'Altın ve gümüş paraların olduğu kutularda koşullu olasılığın şaşırtan sonucu.' },
            { icon: <BarChart3 size={24} />, name: 'Simpson Paradoksu', desc: 'Alt gruplarda görülen bir eğilim, gruplar birleştirildiğinde neden tersine dönebilir?' },
            { icon: <Lock size={24} />, name: 'Tutsak İkilemi', desc: 'İki tutsak sessiz mi kalmalı yoksa birbirini mi suçlamalı? Oyun teorisi temelleri.' },
          ].map((item) => (
            <div key={item.name} style={styles.upcomingItem}>
              <span style={styles.upcomingIcon}>{item.icon}</span>
              <div>
                <div style={styles.upcomingName}>{item.name}</div>
                <div style={styles.upcomingDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 960,
    margin: '0 auto',
    padding: 'var(--space-8) var(--space-4)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-10)',
  },
  hero: {
    textAlign: 'center' as const,
    position: 'relative' as const,
    padding: 'var(--space-16) 0 var(--space-8)',
  },
  heroGlow: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-4)',
  },
  heroTitle: {
    fontSize: 'var(--font-size-5xl)',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #e2e8f0 0%, #818cf8 50%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    lineHeight: 1.1,
  },
  heroIcon: {
    fontSize: 'var(--font-size-4xl)',
    WebkitTextFillColor: 'initial',
    color: 'var(--color-accent-light)',
  },
  heroSubtitle: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  heroDescription: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-muted)',
    maxWidth: 560,
    lineHeight: 1.7,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 'var(--space-6)',
  },
  upcoming: {
    padding: 'var(--space-8)',
  },
  upcomingTitle: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 700,
    marginBottom: 'var(--space-6)',
  },
  upcomingGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  upcomingItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    opacity: 0.6,
  },
  upcomingIcon: {
    fontSize: 'var(--font-size-2xl)',
    lineHeight: 1,
    flexShrink: 0,
    marginTop: 2,
  },
  upcomingName: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: 2,
  },
  upcomingDesc: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.6,
  },
};

export default HomePage;
