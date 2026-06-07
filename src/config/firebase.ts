import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Enable persistence (keep user logged in across sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set persistence:', error);
});

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulators in development (optional)
// Uncomment when running Firebase emulator locally
/*
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.warn('Emulator connection error (may already be connected):', error);
  }
}
*/

export default app;
