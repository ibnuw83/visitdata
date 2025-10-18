
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query } from 'firebase/firestore';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';

export function useCollection<T>(
  q: Query | null
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Jangan jalankan kalau query belum siap
    if (!q) {
      setData([]);
      // Set loading to true if we expect a query but haven't received it yet.
      // Set to false if we're sure no query will be provided.
      // A simple approach is to always show loading until a query is processed.
      setLoading(true); 
      setError(null);
      return;
    }

    let unsubscribed = false;

    setLoading(true);
    setError(null);
    setData([]);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (unsubscribed) return;
        const result = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(result);
        setLoading(false);
      },
      (err: Error) => {
        console.error('useCollection error:', err);

        let errorPath = '(unknown)';
        try {
          // @ts-ignore
          errorPath = q?._query?.path?.segments?.join('/') ?? '(unknown)';
        } catch {}

        const permissionError = new FirestorePermissionError({
          path: errorPath,
          operation: 'list',
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
  }, [q]);

  return { data, loading, error };
}
