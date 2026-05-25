import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
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
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

const DEMO_USER_KEY = 'khmer-typing-demo-user';
const DEMO_SESSION_EVENT = 'khmer-demo-session-change';

export type AppSession = {
  mode: 'firebase' | 'demo';
  userId?: string;
  user?: User | null;
};

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getDemoSession(): AppSession | null {
  const demoUserId = getLocalStorage()?.getItem(DEMO_USER_KEY);
  return demoUserId ? { mode: 'demo', userId: demoUserId, user: null } : null;
}

function setDemoSession(userId: string) {
  getLocalStorage()?.setItem(DEMO_USER_KEY, userId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
  }
}

export function subscribeToSession(onChange: (session: AppSession | null) => void) {
  if (!auth) {
    onChange(getDemoSession());
    const updateDemoSession = () => onChange(getDemoSession());
    window.addEventListener(DEMO_SESSION_EVENT, updateDemoSession);
    window.addEventListener('storage', updateDemoSession);
    return () => {
      window.removeEventListener(DEMO_SESSION_EVENT, updateDemoSession);
      window.removeEventListener('storage', updateDemoSession);
    };
  }

  return onAuthStateChanged(auth, (user) => {
    onChange(user ? { mode: 'firebase', userId: user.uid, user } : getDemoSession());
  });
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function createAccountWithEmail(email: string, password: string) {
  if (!auth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function signInWithGoogle() {
  if (!auth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function signInAsGuest() {
  if (!auth) {
    const userId = `demo-${Date.now()}`;
    setDemoSession(userId);
    return { mode: 'demo' as const, userId };
  }

  const credential = await signInAnonymously(auth);
  return { mode: 'firebase' as const, userId: credential.user.uid, user: credential.user };
}

export async function signOutSession() {
  getLocalStorage()?.removeItem(DEMO_USER_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
  }
  if (auth?.currentUser) {
    await signOut(auth);
  }
}

export async function ensureFirebaseSession() {
  if (!auth || auth.currentUser) {
    return { mode: firebaseEnabled ? 'firebase' : 'demo', userId: auth?.currentUser?.uid };
  }

  try {
    const credential = await signInAnonymously(auth);
    return { mode: 'firebase', userId: credential.user.uid };
  } catch {
    return { mode: 'demo', userId: undefined };
  }
}
