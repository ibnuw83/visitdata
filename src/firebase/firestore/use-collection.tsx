
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(q: Query<T> | null): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set loading to true when the query changes.
    setLoading(true);
    setData([]); // Clear old data

    if (!q) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q as Query<DocumentData>,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(data);
        setLoading(false);
        setError(null);
      },
      (err: Error) => {
        console.error("useCollection error:", err);
        
        let path = 'unknown_path';
        try {
            // This is a simplified way to get path from a query.
            // Firestore queries have a private `_query` property. This is not a stable API.
            const internalQuery = (q as any)._query;
            if (internalQuery && internalQuery.path) {
                path = internalQuery.path.segments.join('/');
            } else if ((q as any)._path) {
                 path = (q as any)._path.segments.join('/');
            }
        } catch (e) {
            console.warn("Could not extract path from Firestore query for error reporting.", e);
        }

        const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
        });

        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]); // Depend directly on the query object. Stability must be ensured by the caller with useMemo.

  return { data, loading, error };
}
