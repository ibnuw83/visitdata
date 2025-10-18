'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { handleFirestoreError } from '@/lib/firebase/listeners/firestore-error-handler';
import { handleAuthError } from '@/lib/firebase/listeners/auth-error-handler';
import { handleGenericError } from '@/lib/firebase/listeners/generic-error-handler';
import {
  FirestorePermissionError,
  FirestoreGenericError,
  AuthError,
  NetworkError,
} from '@/lib/firebase/errors';


/**
 * 🔥 Global Firebase Error Listener
 * Dipasang di dalam FirebaseClientProvider untuk menangkap semua event error
 * dari `errorEmitter` dan menampilkannya sebagai notifikasi toast.
 */
export function FirebaseErrorListener() {
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

    return () => {
      errorEmitter.off('permission-error', onPermissionError);
      errorEmitter.off('firestore-error', onGenericFirestoreError);
      errorEmitter.off('auth-error', onAuthError);
      errorEmitter.off('network-error', onNetworkError);
    };
  }, [toast]);

  return null;
}
