'use client';

import { useState, useEffect } from 'react';
import { getDocs, Query } from 'firebase/firestore';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';

export function useQuery<T>(
  q: Query | null
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getDocs(q)
      .then((snapshot) => {
        if (isMounted) {
            const result = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as T[];
            setData(result);
        }
      })
      .catch((err) => {
        console.error('useQuery error:', err);

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
        if (isMounted) {
            setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
            setLoading(false)
        }
      });
      
      return () => {
          isMounted = false;
      }
  }, [q]);

  return { data, loading, error };
}
