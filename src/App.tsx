import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { subscribeToSession, type AppSession } from './lib/firebase';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const WorldMapPage = lazy(() => import('./pages/WorldMapPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const BattlePage = lazy(() => import('./pages/BattlePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage'));

function ProtectedRoute({ session, children }: { session: AppSession | null; children: ReactNode }) {
  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const [session, setSession] = useState<AppSession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSession((nextSession) => {
      setSession(nextSession);
      setSessionReady(true);
    });
    return unsubscribe;
  }, []);

  if (!sessionReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-sky text-center">
        <div className="rounded-3xl bg-white/80 px-8 py-6 text-2xl font-black text-adventure shadow-game">Checking Adventure Pass...</div>
      </div>
    );
  }

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
          <Route path="/" element={session ? <HomePage /> : <LoginPage />} />
          <Route path="/map" element={<ProtectedRoute session={session}><WorldMapPage /></ProtectedRoute>} />
          <Route path="/lesson" element={<ProtectedRoute session={session}><LessonPage /></ProtectedRoute>} />
          <Route path="/battle" element={<ProtectedRoute session={session}><BattlePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute session={session}><DashboardPage /></ProtectedRoute>} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
