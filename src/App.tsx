/* ============================================================
   App — Root Component with Simple State-based Routing
   ============================================================ */

import React, { Suspense, useState, useCallback } from 'react';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import registry from './paradoxes/registry';

const App: React.FC = () => {
  const [activeParadoxId, setActiveParadoxId] = useState<string | null>(null);

  const handleSelectParadox = useCallback((id: string) => {
    setActiveParadoxId(id);
  }, []);

  const handleGoHome = useCallback(() => {
    setActiveParadoxId(null);
  }, []);

  const activeParadox = registry.find((p) => p.id === activeParadoxId);

  return (
    <Layout
      activeParadoxId={activeParadoxId}
      onSelectParadox={handleSelectParadox}
      onGoHome={handleGoHome}
    >
      <Suspense fallback={<LoadingFallback />}>
        {activeParadox ? (
          <activeParadox.component />
        ) : (
          <HomePage onSelectParadox={handleSelectParadox} />
        )}
      </Suspense>
    </Layout>
  );
};

const LoadingFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-lg)',
    gap: 'var(--space-3)',
  }}>
    <div style={{
      width: 24,
      height: 24,
      border: '2px solid var(--color-accent-subtle)',
      borderTopColor: 'var(--color-accent)',
      borderRadius: '50%',
      animation: 'spin 800ms linear infinite',
    }} />
    Yükleniyor...
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default App;
