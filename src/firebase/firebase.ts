import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firestore with modern persistent cache (multi-tab support)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Auth with local persistence
export const auth = getAuth(app);

// Configure Auth persistence to survive page reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('[Firebase] Auth persistence enabled');
  })
  .catch((error) => {
    console.error('[Firebase] Error enabling auth persistence:', error);
  });

// Initialize Storage
export const storage = getStorage(app);

console.log('[Firebase] Services initialized successfully');
