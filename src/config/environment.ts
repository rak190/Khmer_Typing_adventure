const requiredFirebaseEnv = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

export const appEnvironment = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  firebase: {
    required: requiredFirebaseEnv,
    missingKeys: Object.entries(requiredFirebaseEnv)
      .filter(([, value]) => !value)
      .map(([key]) => key),
  },
} as const;

export const firebaseConfigComplete = appEnvironment.firebase.missingKeys.length === 0;
export const demoAuthFallbackEnabled = appEnvironment.isDevelopment && !firebaseConfigComplete;

export function getFirebaseConfigMessage() {
  if (firebaseConfigComplete) return 'Firebase Auth and Firestore are configured.';

  const missing = appEnvironment.firebase.missingKeys.join(', ');
  return appEnvironment.isDevelopment
    ? `Development demo mode: Firebase is not configured. Missing ${missing}. Progress may use local or in-memory fallback only.`
    : `Production Firebase configuration is incomplete. Missing ${missing}. Login and saved progress are disabled until Firebase is configured.`;
}
