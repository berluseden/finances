import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAyAQdnZqzc8ovY3EsbGT8h2jLASE0M-Zw',
  authDomain: 'finances-92740.firebaseapp.com',
  projectId: 'finances-92740',
  storageBucket: 'finances-92740.firebasestorage.app',
  messagingSenderId: '296712058165',
  appId: '1:296712058165:web:e9a2f0940d22a54326087c',
  measurementId: 'G-Z41YXX99VZ',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable Firestore offline persistence for PWA
// Using enableIndexedDbPersistence for compatibility
// Note: In production, consider using persistentCacheIndexManager from modular API
enableIndexedDbPersistence(db, {
  forceOwnership: false // Allow multiple tabs
}).catch((err: { code: string }) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence.');
  }
});

// Uncomment for local emulator development
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }
