'use client';

import { useEffect } from 'react';
import { errorEmitter } from './error-emitter';
import { useToast } from '@/hooks/use-toast';
import { handleFirestoreError } from './listeners/firestore-error-handler';
import { handleAuthError } from './listeners/auth-error-handler';
import { handleGenericError } from './listeners/generic-error-handler';
import {
  FirestorePermissionError,
  FirestoreGenericError,
  AuthError,
  NetworkError,
} from './errors';

/**
 * FirebaseSystemListener — aktifkan sistem global untuk notifikasi error Firebase.
 * Hanya perlu di-import sekali di layout root.
 */
export function FirebaseSystemListener() {
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
