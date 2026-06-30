import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Determine if Firebase is fully configured with actual keys
export const isFirebaseConfigured = (): boolean => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return !!(key && key !== 'your_api_key' && key.trim() !== '');
};

// Initialize Firebase app if configured, otherwise use fallback dummy values
const dummyConfig = {
  apiKey: "dummy-key-for-initialization",
  authDomain: "dummy-auth-domain",
  projectId: "dummy-project-id",
};

const app = initializeApp(isFirebaseConfigured() ? firebaseConfig : dummyConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set SMS language dynamically
