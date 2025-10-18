
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, Query, DocumentData, collection, query, where, getDocs, QuerySnapshot } from 'firebase/firestore';
import { useFirestore } from '../client-provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions {
  // Add any options here
}

// Overload for when query is provided
export function useCollection<T>(q: Query<T> | null): { data: T[]; loading: boolean; error: Error | null };
// Overload for when path is provided
export function useCollection<T>(path: string | null): { data: T[]; loading: boolean; error: Error | null };
// Overload for when path and queryFn are provided
export function useCollection<T>(
  path: string | null,
  queryFn: (ref: any) => any
): { data: T[]; loading: boolean; error: Error | null };


export function useCollection<T>(
  pathOrQuery: string | Query<T> | null,
  queryFn?: (ref: any) => any
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const firestore = useFirestore();

  const queryObj = useMemo(() => {
    if (!pathOrQuery || !firestore) {
      return null;
    }

    if (typeof pathOrQuery === 'string') {
        let ref = collection(firestore, pathOrQuery);
        return queryFn ? queryFn(ref) : ref;
    }
    return pathOrQuery;
  }, [pathOrQuery, queryFn, firestore]);
  

  useEffect(() => {
    if (!queryObj) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      queryObj as Query<DocumentData>,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(data);
        setLoading(false);
      },
      (err: Error) => {
        console.error("useCollection error:", err);
        const permissionError = new FirestorePermissionError({
            path: (queryObj as any)._path?.toString() || 'unknown',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryObj]);

  return { data, loading, error };
}
