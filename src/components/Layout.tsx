/* ============================================================
   Layout — Sidebar + Content Shell
   ============================================================ */

import React from 'react';
import { Infinity, Volume2, VolumeX, Beaker } from 'lucide-react';
import registry from '../paradoxes/registry';
import { useSound } from '../hooks/useSound';

interface LayoutProps {
  activeParadoxId: string | null;
  onSelectParadox: (id: string) => void;
  onGoHome: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  activeParadoxId,
  onSelectParadox,
  onGoHome,
  children,
}) => {
  const { isSoundEnabled, toggleSound } = useSound();

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader} onClick={onGoHome}>
          <div style={styles.logo}>
            <Infinity size={20} strokeWidth={3} />
          </div>
          <div>
            <div style={styles.logoTitle}>Paradoxes</div>
            <div style={styles.logoSubtitle}>Olasılık Simülatörü</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navLabel}>Paradokslar</div>
          {registry.map((paradox) => {
            const isActive = activeParadoxId === paradox.id;
            return (
              <button
                key={paradox.id}
                onClick={() => onSelectParadox(paradox.id)}
                style={{
                  ...styles.navItem,
                  background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                  borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                }}
              >
                <span style={styles.navIcon}>{paradox.icon}</span>
                <span style={styles.navText}>{paradox.shortTitle}</span>
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button style={styles.soundToggle} onClick={toggleSound} title={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}>
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{isSoundEnabled ? 'Ses Açık' : 'Ses Kapalı'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: 'var(--color-bg-elevated)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
    overflow: 'auto',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-6) var(--space-5)',
    borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'opacity var(--transition-fast)',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, var(--color-accent) 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: 1.2,
  },
  logoSubtitle: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.2,
  },
  nav: {
    flex: 1,
    padding: 'var(--space-4) var(--space-3)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  navLabel: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    padding: 'var(--space-2) var(--space-3)',
    marginBottom: 'var(--space-1)',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    transition: 'all var(--transition-fast)',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  navText: {
    flex: 1,
  },
  sidebarFooter: {
    padding: 'var(--space-4) var(--space-5)',
    borderTop: '1px solid var(--color-border)',
  },
  soundToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 'var(--space-2) 0',
    transition: 'color var(--transition-fast)',
  },
  main: {
    flex: 1,
    minHeight: '100vh',
    overflow: 'auto',
  },
};

export default Layout;
