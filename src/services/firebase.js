// Firebase configuration
// Note: Storage is handled by Supabase, not Firebase
// Get these values from Firebase Console > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
// Make sure to create a .env file with these variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate that all required config values are present
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
  console.error('Firebase configuration is missing. Please set VITE_FIREBASE_API_KEY in your .env file');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
// Note: Storage is handled by Supabase (see src/services/supabase.js)
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
