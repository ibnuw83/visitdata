
'use client';

import { useEffect, useState, ReactNode, createContext, useContext, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signOut } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

const FirebaseAppContext = createContext<FirebaseApp | null>(null);
const FirestoreContext = createContext<Firestore | null>(null);
const AuthContext = createContext<Auth | null>(null);
const AuthUserContext = createContext<{ user: User | null, isLoading: boolean, logout: () => Promise<void> } | undefined>(undefined);

function handleFirestoreError(toast: any, error: { code: string, message: string }) {
    if (error.code === 'permission-denied') {
        toast({
            variant: 'destructive',
            title: 'Akses Firestore Ditolak 🔒',
            description: `Anda tidak memiliki izin untuk melakukan tindakan ini.`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Kesalahan Firestore ⚠️',
            description: error.message || 'Terjadi kesalahan pada operasi Firestore.',
        });
    }
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();

  const { app, auth, firestore } = useMemo(() => {
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      console.error("Firebase config is missing or invalid.");
      return { app: null, auth: null, firestore: null };
    }
    const existingApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const authInstance = getAuth(existingApp);
    const firestoreInstance = getFirestore(existingApp);
    return { app: existingApp, auth: authInstance, firestore: firestoreInstance };
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

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
      console.error = originalConsoleError;
    };
  }, [toast]);

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const authUserContextValue = { user, isLoading: loading, logout };

  if (!app) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="flex flex-col items-center gap-4">
                <Logo className="h-10 w-10 text-destructive" />
                <h1 className="text-xl font-bold">Konfigurasi Firebase Tidak Ditemukan</h1>
                <p className="text-muted-foreground max-w-md">
                    Pastikan konfigurasi Firebase Anda benar. Hubungi administrator jika masalah berlanjut.
                </p>
            </div>
        </div>
     );
  }

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
            {children}
          </AuthUserContext.Provider>
        </AuthContext.Provider>
      </FirestoreContext.Provider>
    </FirebaseAppContext.Provider>
  );
}

export const useFirebaseApp = (): FirebaseApp => {
  const ctx = useContext(FirebaseAppContext);
  if (!ctx) throw new Error('useFirebaseApp must be used within a FirebaseClientProvider');
  return ctx;
};

export const useFirestore = (): Firestore | null => {
  return useContext(FirestoreContext);
};

export const useAuth = (): Auth | null => {
  return useContext(AuthContext);
};

export const useAuthUser = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error('useAuthUser must be used within a FirebaseClientProvider');
  }
  return context;
};
