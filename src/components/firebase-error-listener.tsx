
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/lib/firebase/errors';

/**
 * 🔥 Global Firestore Error Listener
 * Dapat dipasang di layout utama (RootLayout) agar setiap
 * FirestorePermissionError otomatis tampil di toast UI.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      const { path, operation } = error.context || {};
      const readableOp =
        operation === 'list'
          ? 'membaca data'
          : operation === 'write'
          ? 'menulis data'
          : operation === 'create'
          ? 'membuat data'
          : operation === 'update'
          ? 'memperbarui data'
          : operation === 'delete'
          ? 'menghapus data'
          : 'mengakses Firestore';

      toast({
        variant: 'destructive',
        title: 'Akses Firestore Ditolak 🔒',
        description: `Tidak memiliki izin untuk ${readableOp} pada path: ${path || '(tidak diketahui)'}.`,
      });

      console.warn('[FirestorePermissionError]', error);
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
