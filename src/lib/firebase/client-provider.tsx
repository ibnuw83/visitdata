'use client';

import React, { createContext, useContext, useMemo, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from './error-emitter';
import { handleFirestoreError } from './listeners/firestore-error-handler';
import { handleAuthError } from './listeners/auth-error-handler';
import { handleGenericError } from './listeners/generic-error-handler';
import {
  FirestorePermissionError,
  FirestoreGenericError,
  AuthError,
  NetworkError,
} from './errors';
import { Logo } from '@/components/logo';
import { useRouter } from 'next/navigation';


function FirebaseSystemListener() {
  const { toast } = useToast();

  useEffect(() => {
    const onPermissionError = (error: FirestorePermissionError) => handleFirestoreError(toast, error);
    const onGenericFirestoreError = (error: FirestoreGenericError) => handleFirestoreError(toast, error);
    const onAuthError = (error: AuthError) => handleAuthError(toast, error);
    const onNetworkError = (error: NetworkError) => handleGenericError(toast, error);

    errorEmitter.on('permission-error', onPermissionError);
    errorEmitter.on('firestore-error', onGenericFirestoreError);
    errorEmitter.on('auth-error', onAuthError);
    errorEmitter.on('network-error', onNetworkError);

    const handleOffline = () => errorEmitter.emit('network-error', new NetworkError());
    window.addEventListener('offline', handleOffline);

    return () => {
      errorEmitter.off('permission-error', onPermissionError);
      errorEmitter.off('firestore-error', onGenericFirestoreError);
      errorEmitter.off('auth-error', onAuthError);
      errorEmitter.off('network-error', onNetworkError);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return null;
}


const FirebaseAppContext = createContext<FirebaseApp | null>(null);
const FirestoreContext = createContext<Firestore | null>(null);
const AuthContext = createContext<Auth | null>(null);
const AuthUserContext = createContext<{ user: FirebaseUser | null, isLoading: boolean, logout: () => Promise<void> } | undefined>(undefined);

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { app, auth, firestore } = useMemo(() => {
    const existingApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const authInstance = getAuth(existingApp);
    const firestoreInstance = getFirestore(existingApp);
    return { app: existingApp, auth: authInstance, firestore: firestoreInstance };
  }, []);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const authUserContextValue = { user, isLoading, logout };

  if (isLoading) {
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
            <FirebaseSystemListener />
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

export const useFirestore = (): Firestore => {
  const ctx = useContext(FirestoreContext);
  if (!ctx) throw new Error('useFirestore must be used within a FirebaseClientProvider');
  return ctx;
};

export const useAuth = (): Auth => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within a FirebaseClientProvider');
  return ctx;
};

export const useAuthUser = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error('useAuthUser must be used within a FirebaseClientProvider');
  }
  return context;
};
