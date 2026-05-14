import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ensureFirebaseSession } from './lib/firebase';

const HomePage = lazy(() => import('./pages/HomePage'));
const WorldMapPage = lazy(() => import('./pages/WorldMapPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const BattlePage = lazy(() => import('./pages/BattlePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage'));

export default function App() {
  const location = useLocation();
  const [, setDataMode] = useState<'demo' | 'firebase'>('demo');

  useEffect(() => {
    let mounted = true;
    ensureFirebaseSession().then((result) => {
      if (mounted) {
        setDataMode(result.mode as 'demo' | 'firebase');
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-sky text-center">
            <div className="rounded-3xl bg-white/80 px-8 py-6 text-2xl font-black text-adventure shadow-game">Loading Adventure...</div>
          </div>
        }
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<WorldMapPage />} />
          <Route path="/lesson" element={<LessonPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
