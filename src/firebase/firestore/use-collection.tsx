
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(
  q: Query | null
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (q === null) {
      setData([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err: Error) => {
        console.error('useCollection error:', err);
        
        let errorPath = 'unknown';
        try {
           // @ts-ignore internal property
           errorPath = q._query.path.segments.join('/');
        } catch (e) {
            console.warn("Could not extract path from Firestore query for error reporting.", e);
        }

        const permissionError = new FirestorePermissionError({
          path: errorPath,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
}
