import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { demoAuthFallbackEnabled, firebaseConfigComplete, getFirebaseConfigMessage } from '../config/environment';

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
if (useEmulators && !import.meta.env.DEV) throw new Error('Emulators require development mode');
const firebaseConfig = useEmulators ? { apiKey: 'demo-key', authDomain: 'demo-khmer-typing.firebaseapp.com', projectId: 'demo-khmer-typing', appId: 'demo-app' } : {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseEnabled = useEmulators || firebaseConfigComplete;
export const firebaseStatusMessage = getFirebaseConfigMessage();

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let functions: Functions | undefined;

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app, 'us-central1');
  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }
} else if (import.meta.env.DEV) {
  console.warn(firebaseStatusMessage);
}

export { app, auth, db, functions };

const DEMO_SESSION_EVENT = 'khmer-demo-session-change';
let inMemoryDemoUserId: string | undefined;

export type AppSession = {
  mode: 'firebase' | 'demo';
  userId?: string;
  user?: User | null;
};

export function getDemoSession(): AppSession | null {
  return inMemoryDemoUserId ? { mode: 'demo', userId: inMemoryDemoUserId, user: null } : null;
}

function setDemoSession(userId: string) {
  inMemoryDemoUserId = userId;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
  }
}

export function subscribeToSession(onChange: (session: AppSession | null) => void) {
  if (!auth) {
    if (!demoAuthFallbackEnabled) {
      onChange(null);
      return () => undefined;
    }

    onChange(getDemoSession());
    const updateDemoSession = () => onChange(getDemoSession());
    window.addEventListener(DEMO_SESSION_EVENT, updateDemoSession);
    return () => {
      window.removeEventListener(DEMO_SESSION_EVENT, updateDemoSession);
    };
  }

  return onAuthStateChanged(auth, (user) => {
    onChange(user ? { mode: 'firebase', userId: user.uid, user } : null);
  });
}

function requireAuth() {
  if (!auth) {
    if (demoAuthFallbackEnabled) return null;
    throw new Error(firebaseStatusMessage);
  }

  return auth;
}

export async function signInWithEmail(email: string, password: string) {
  const activeAuth = requireAuth();
  if (!activeAuth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const credential = await signInWithEmailAndPassword(activeAuth, email, password);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function createAccountWithEmail(email: string, password: string) {
  const activeAuth = requireAuth();
  if (!activeAuth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const credential = await createUserWithEmailAndPassword(activeAuth, email, password);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function signInWithGoogle() {
  const activeAuth = requireAuth();
  if (!activeAuth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(activeAuth, provider);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function signInAsGuest() {
  const activeAuth = requireAuth();
  if (!activeAuth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const credential = await signInAnonymously(activeAuth);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function signOutSession() {
  inMemoryDemoUserId = undefined;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
  }
  if (auth?.currentUser) {
    await signOut(auth);
  }
}

export async function ensureFirebaseSession() {
  if (auth?.currentUser) {
    return { mode: 'firebase' as const, userId: auth.currentUser.uid, user: auth.currentUser };
  }

  return demoAuthFallbackEnabled ? getDemoSession() : null;
}
