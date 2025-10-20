'use client';

import { useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

// --- CONTEXT DEFINITIONS ---
const FirebaseAppContext = createContext<FirebaseApp | null>(null);
const FirestoreContext = createContext<Firestore | null>(null);
const AuthContext = createContext<Auth | null>(null);
const AuthUserContext = createContext<{ user: User | null; isLoading: boolean; logout: () => Promise<void> } | undefined>(undefined);

// --- FIREBASE INITIALIZATION (SINGLETON PATTERN) ---
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase config is missing. Please check your environment variables and src/lib/firebase/config.ts");
  }
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

// --- PROVIDER COMPONENT ---
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    // Use window.location to force a full page reload to clear all state
    window.location.href = '/login';
  };

  const authUserContextValue = { user, isLoading: loading, logout };

  // Display a loading indicator while auth state is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Logo className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  return (
    <FirebaseAppContext.Provider value={firebaseApp}>
      <FirestoreContext.Provider value={firestore}>
        <AuthContext.Provider value={auth}>
          <AuthUserContext.Provider value={authUserContextValue}>
            {children}
          </AuthUserContext.Provider>
        </AuthContext.Provider>
      </FirestoreContext.Provider>
    </FirebaseAppContext.Provider>
  );
}

// --- HOOKS ---
export const useFirebaseApp = (): FirebaseApp | null => useContext(FirebaseAppContext);
export const useFirestore = (): Firestore | null => useContext(FirestoreContext);
export const useAuth = (): Auth | null => useContext(AuthContext);

export const useAuthUser = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error('useAuthUser must be used within a FirebaseClientProvider');
  }
  return context;
};
