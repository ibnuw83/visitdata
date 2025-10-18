'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference } from 'firebase/firestore';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';

export function useDoc<T>(
  ref: DocumentReference | null
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    let unsubscribed = false;
    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (unsubscribed) return;
        setData(snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as T) : null);
        setLoading(false);
      },
      (err: Error) => {
        console.error('useDoc error:', err);

        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (!unsubscribed) {
          setError(err);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, [ref]);

  return { data, loading, error };
}
