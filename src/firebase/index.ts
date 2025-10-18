
// This file serves as a central hub for re-exporting Firebase-related utilities,
// making it easier to import them across the application.

// Core client providers and hooks
export { FirebaseClientProvider, useFirebaseApp, useFirestore, useAuth } from '@/lib/firebase/client-provider';

// Authentication hook
export { useUser } from '@/lib/firebase/auth/use-user';

// Firestore hooks
export { useCollection, useDoc, useQuery } from '@/lib/firebase/firestore';

// Error handling utilities
export { errorEmitter } from '@/lib/firebase/error-emitter';
export { FirestorePermissionError, AuthError } from '@/lib/firebase/errors';
