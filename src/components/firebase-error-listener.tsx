
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { useToast } from '@/hooks/use-toast';


export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // This is where you would handle the permission error.
      // For this example, we'll show a toast notification.
      console.error(
        'Firestore Permission Error:',
        JSON.stringify(
          {
            message: error.message,
            context: error.context,
          },
          null,
          2
        )
      );

      toast({
        variant: 'destructive',
        title: 'Izin Ditolak',
        description: `Anda tidak memiliki izin untuk melakukan tindakan pada '${error.context.path}'. Periksa aturan keamanan Firestore Anda.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
