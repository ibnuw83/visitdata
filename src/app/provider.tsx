
'use client';

import { useEffect, useState, ReactNode, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signOut } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase/config';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { handleFirestoreError } from '@/lib/firebase/listeners/firestore-error-handler';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

const FirebaseAppContext = createContext<FirebaseApp | null>(null);
const FirestoreContext = createContext<Firestore | null>(null);
const AuthContext = createContext<Auth | null>(null);
const AuthUserContext = createContext<{ user: User | null, isLoading: boolean, logout: () => Promise<void> } | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { toast } = useToast();
  const router = useRouter();

  const { app, auth, firestore } = useMemo(() => {
    const existingApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const authInstance = getAuth(existingApp);
    const firestoreInstance = getFirestore(existingApp);
    return { app: existingApp, auth: authInstance, firestore: firestoreInstance };
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Global Firestore Error Interceptor
  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args: any[]) => {
      const firstArg = args[0];
      
      if (typeof firstArg === 'string' && firstArg.includes("FIRESTORE") && firstArg.includes("PERMISSION_DENIED")) {
        handleFirestoreError(toast, { code: 'permission-denied', message: firstArg });
      } else {
        originalConsoleError(...args);
      }
    };

    return () => {
      console.error = originalConsoleError; // restore on unmount
    };
  }, [toast]);

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const authUserContextValue = { user, isLoading: loading, logout };

  // Loading screen while auth is not ready
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Logo className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  return (
    <FirebaseAppContext.Provider value={app}>
      <FirestoreContext.Provider value={firestore}>
        <AuthContext.Provider value={auth}>
          <AuthUserContext.Provider value={authUserContextValue}>
            <Toaster />
            {children}
          </AuthUserContext.Provider>
        </AuthContext.Provider>
      </FirestoreContext.Provider>
    </FirebaseAppContext.Provider>
  );
}

export const useFirebaseApp = (): FirebaseApp => {
  const ctx = useContext(FirebaseAppContext);
  if (!ctx) throw new Error('useFirebaseApp must be used within an AppProvider');
  return ctx;
};

export const useFirestore = (): Firestore => {
  const ctx = useContext(FirestoreContext);
  if (!ctx) throw new Error('useFirestore must be used within an AppProvider');
  return ctx;
};

export const useAuth = (): Auth => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AppProvider');
  return ctx;
};

export const useAuthUser = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error('useAuthUser must be used within an AppProvider');
  }
  return context;
};
