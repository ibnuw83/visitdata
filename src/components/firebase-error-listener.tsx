
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';


export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // This is where you would handle the permission error.
      // For example, you could show a toast notification, or
      // redirect the user to a login page.
      //
      // For this example, we'll just log the error to the console
      // in a more readable format.
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

      // In a real app, you might want to show a toast notification.
      // import { toast } from '@/hooks/use-toast';
      // toast({
      //   variant: 'destructive',
      //   title: 'Permission Denied',
      //   description: `You don't have permission to perform this action.`,
      // });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
