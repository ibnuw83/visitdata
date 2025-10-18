'use client';

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
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

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { app, auth, firestore } = useMemo(() => {
    const existingApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const authInstance = getAuth(existingApp);
    const firestoreInstance = getFirestore(existingApp);
    return { app: existingApp, auth: authInstance, firestore: firestoreInstance };
  }, []);

  return (
    <FirebaseAppContext.Provider value={app}>
      <FirestoreContext.Provider value={firestore}>
        <AuthContext.Provider value={auth}>
          {children}
          <FirebaseSystemListener />
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
