
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
    // Jangan jalankan apapun kalau referensi belum siap
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    let unsubscribed = false;

    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (unsubscribed) return;
        if (doc.exists()) {
          setData({ ...doc.data(), id: doc.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        if (unsubscribed) return;
        console.error('useDoc error:', err);
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
        unsubscribed = true;
        unsubscribe();
    };
  }, [ref]);

  return { data, loading, error };
};
