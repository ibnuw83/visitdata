
'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseProvider, initializeFirebase } from '.';

const FirebaseAppContext = createContext<FirebaseApp | undefined>(undefined);
const FirestoreContext = createContext<Firestore | undefined>(undefined);
const AuthContext = createContext<Auth | undefined>(undefined);

/**
 * This provider is used to initialize the Firebase app on the client side.
 * It ensures that the Firebase app is only initialized once, and that the
 * same instance is used throughout the app.
 *
 * It should be used as a wrapper around the root of your app.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { firebaseApp, auth, firestore } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseAppContext.Provider value={firebaseApp}>
      <FirestoreContext.Provider value={firestore}>
        <AuthContext.Provider value={auth}>
          <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
            {children}
          </FirebaseProvider>
        </AuthContext.Provider>
      </FirestoreContext.Provider>
    </FirebaseAppContext.Provider>
  );
}

export const useFirebaseApp = () => {
  const firebaseApp = useContext(FirebaseAppContext);
  if (!firebaseApp) {
    throw new Error('useFirebaseApp must be used within a FirebaseClientProvider');
  }
  return firebaseApp;
};

export const useFirestore = () => {
  const firestore = useContext(FirestoreContext);
  if (!firestore) {
    throw new Error('useFirestore must be used within a FirebaseClientProvider');
  }
  return firestore;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within a FirebaseClientProvider');
  }
  return auth;
};
