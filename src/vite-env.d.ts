/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_ADS_ENABLED?: string;
  readonly VITE_PERSONALIZED_ADS_ENABLED?: string;
  readonly VITE_CHILD_DIRECTED_TREATMENT?: string;
  readonly VITE_GOOGLE_ADSENSE_ACCOUNT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
