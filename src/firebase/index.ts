// This file is the single source of truth for all Firebase-related functionality.
// It exports a set of hooks and providers that can be used to interact with Firebase services.
'use client';

// IMPORTANT: Do not use `initializeApp` directly in your code. Always use the `useFirebaseApp` hook.

import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Main hooks for data fetching
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
export { useMemoFirebase } from './use-memo-firebase';

// Providers and context hooks
export { FirebaseProvider, useFirebase } from './provider';
export { FirebaseClientProvider, useFirebaseApp, useFirestore, useAuth } from './client-provider';

// Centralized error handling
export { FirestorePermissionError } from './errors';
export { errorEmitter } from './error-emitter';

// We only want to initialize the app once, but we need to be able to use the hooks in different components.
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

/**
 * Initializes the Firebase app and returns the app, auth, and firestore instances.
 * This function is idempotent, meaning it will only initialize the app once.
 * 
 * In a Next.js environment, this function should be called in a server component
 * or a layout component that is only rendered once on the server.
 */
export const initializeFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);

    // If you want to use the local emulators, uncomment the following lines
    // and make sure you have the emulators running.
    // NOTE: Make sure you are running the emulators on the correct ports.
    // if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    //   console.log('Using Firebase Emulators');
    //   connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    //   connectFirestoreEmulator(firestore, 'localhost', 8080);
    // }
  }

  return { firebaseApp, auth, firestore };
};
