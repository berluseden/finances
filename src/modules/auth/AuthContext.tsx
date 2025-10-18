import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { getDocument, createDocument } from '@/firebase/firestore';
import type { User } from '@/types/models';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[AuthContext] Initializing auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', {
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        emailVerified: firebaseUser?.emailVerified
      });

      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          console.log('[AuthContext] Fetching user document from Firestore...');
          
          // Fetch user document from Firestore
          const userDoc = await getDocument<User>('users', firebaseUser.uid);
          
          console.log('[AuthContext] User document:', userDoc);
          
          if (!userDoc) {
            console.error('[AuthContext] ❌ User document not found in Firestore');
            setError('Usuario sin documento en Firestore. Contacta al administrador.');
            
            // Logout user if no Firestore document exists
            await firebaseSignOut(auth);
            setCurrentUser(null);
            setFirebaseUser(null);
          } else {
            console.log('[AuthContext] ✅ User authenticated successfully:', {
              id: userDoc.id,
              email: userDoc.email,
              role: userDoc.role
            });
            setCurrentUser(userDoc);
            setError(null);
          }
        } catch (err) {
          console.error('[AuthContext] ❌ Error fetching user document:', err);
          setError('Error al obtener datos del usuario');
          setCurrentUser(null);
        }
      } else {
        console.log('[AuthContext] No user authenticated');
        setCurrentUser(null);
        setError(null);
      }

      setLoading(false);
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting sign in for:', email);
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('[AuthContext] Sign in successful:', userCredential.user.uid);
    } catch (err) {
      const authError = err as AuthError;
      console.error('[AuthContext] ❌ Sign in error:', authError.code, authError.message);
      
      // Map Firebase error codes to user-friendly Spanish messages
      switch (authError.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          throw new Error('Email o contraseña incorrectos');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        case 'auth/user-disabled':
          throw new Error('Esta cuenta ha sido deshabilitada');
        case 'auth/too-many-requests':
          throw new Error('Demasiados intentos. Intenta más tarde');
        case 'auth/network-request-failed':
          throw new Error('Error de conexión. Verifica tu internet');
        default:
          throw new Error(`Error de autenticación: ${authError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log('[AuthContext] Attempting sign up for:', email);
      setError(null);
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('[AuthContext] Creating user document in Firestore...');
      
      // Create user document in Firestore
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email: user.email!,
        displayName,
        role: 'user', // Default role
      };

      await createDocument('users', {
        ...userData,
        id: user.uid,
      });
      
      console.log('[AuthContext] ✅ Sign up successful');
    } catch (err) {
      const authError = err as AuthError;
      console.error('[AuthContext] ❌ Sign up error:', authError.code, authError.message);
      
      switch (authError.code) {
        case 'auth/email-already-in-use':
          throw new Error('Este email ya está registrado');
        case 'auth/weak-password':
          throw new Error('La contraseña es muy débil (mínimo 6 caracteres)');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        default:
          throw new Error(`Error al registrar: ${authError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out...');
      await firebaseSignOut(auth);
      console.log('[AuthContext] ✅ Sign out successful');
    } catch (err) {
      console.error('[AuthContext] ❌ Sign out error:', err);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const isAdmin = currentUser?.role === 'admin';

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAdmin,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
