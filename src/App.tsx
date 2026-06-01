import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { subscribeLessonProgressFromFirebase } from './data/mockData';
import { subscribeToSession, type AppSession } from './lib/firebase';
import { ensureUserEconomy, subscribeUserEconomy } from './lib/economy';
import { subscribeStudentProgressFromFirebase } from './lib/studentProgress';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const WorldMapPage = lazy(() => import('./pages/WorldMapPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const BattlePage = lazy(() => import('./pages/BattlePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage'));
const PublicInfoPage = lazy(() => import('./pages/PublicInfoPage'));
const internalRoutesEnabled = import.meta.env.DEV;

const publicRoutes = new Set([
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/help',
  '/parents-teachers',
  '/blog',
  '/lessons',
  '/khmer-keyboard-guide',
  '/typing-practice',
]);

function ProtectedRoute({ session, children }: { session: AppSession | null; children: ReactNode }) {
  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'The page could not load.',
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Route render failed.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-sky px-4 text-center">
          <div className="max-w-xl rounded-[22px] border border-white/70 bg-white/90 p-6 shadow-game">
            <h1 className="text-2xl font-black text-adventure">Adventure page needs a refresh</h1>
            <p className="mt-2 font-bold leading-relaxed text-[#48647D]">
              The page hit a loading problem instead of showing a blank screen. Refresh the browser to reload the adventure.
            </p>
            {this.state.message && (
              <p className="mt-3 rounded-[14px] bg-[#E8F6FF] px-3 py-2 text-sm font-bold text-[#31516F]">{this.state.message}</p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const location = useLocation();
  const [session, setSession] = useState<AppSession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const isInternalRoute = internalRoutesEnabled && location.pathname === '/design-system';
  const isPublicRoute = publicRoutes.has(location.pathname) || isInternalRoute;

  useEffect(() => {
    try {
      const unsubscribe = subscribeToSession((nextSession) => {
        setSession(nextSession);
        setSessionReady(true);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Session startup failed.', error);
      window.setTimeout(() => setSessionReady(true), 0);
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (session?.mode !== 'firebase' || !session.userId) return undefined;

    void ensureUserEconomy(session.userId, session.user?.displayName ?? undefined).catch((error) => console.error('Unable to prepare user economy.', error));
    const unsubscribeEconomy = subscribeUserEconomy(session.userId);
    const unsubscribeStudentProgress = subscribeStudentProgressFromFirebase(session.userId);
    const unsubscribeLessonProgress = subscribeLessonProgressFromFirebase(session.userId);

    return () => {
      unsubscribeEconomy();
      unsubscribeStudentProgress();
      unsubscribeLessonProgress();
    };
  }, [session?.mode, session?.userId, session?.user?.displayName]);

  if (!sessionReady && !isPublicRoute) {
    return (
      <div className="grid min-h-screen place-items-center bg-sky text-center">
        <div className="rounded-[18px] border border-white/60 bg-white/86 px-8 py-6 text-2xl font-black text-adventure shadow-game">Checking Adventure Pass...</div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-sky text-center">
            <div className="rounded-[18px] border border-white/60 bg-white/86 px-8 py-6 text-2xl font-black text-adventure shadow-game">Loading Adventure...</div>
          </div>
        }
      >
        <RouteErrorBoundary>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={session ? <HomePage /> : <LoginPage />} />
            <Route path="/map" element={<ProtectedRoute session={session}><WorldMapPage /></ProtectedRoute>} />
            <Route path="/lesson" element={<ProtectedRoute session={session}><LessonPage /></ProtectedRoute>} />
            <Route path="/battle" element={<ProtectedRoute session={session}><BattlePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute session={session}><DashboardPage /></ProtectedRoute>} />
            <Route path="/shop" element={<ProtectedRoute session={session}><ShopPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute session={session}><ProfilePage /></ProtectedRoute>} />
            {internalRoutesEnabled && <Route path="/design-system" element={<DesignSystemPage />} />}
            <Route path="/about" element={<PublicInfoPage />} />
            <Route path="/contact" element={<PublicInfoPage />} />
            <Route path="/privacy" element={<PublicInfoPage />} />
            <Route path="/terms" element={<PublicInfoPage />} />
            <Route path="/help" element={<PublicInfoPage />} />
            <Route path="/parents-teachers" element={<PublicInfoPage />} />
            <Route path="/blog" element={<PublicInfoPage />} />
            <Route path="/lessons" element={<PublicInfoPage />} />
            <Route path="/khmer-keyboard-guide" element={<PublicInfoPage />} />
            <Route path="/typing-practice" element={<PublicInfoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteErrorBoundary>
      </Suspense>
    </AnimatePresence>
  );
}
