
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, collection, query as firestoreQuery, where, getDocs, QuerySnapshot, CollectionReference } from 'firebase/firestore';
import { useFirestore } from '../client-provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// A helper function to create a stable dependency string from a query object.
// This is a simplified version; a real implementation might need to be more robust.
const getQueryKey = (q: Query<any> | CollectionReference<any> | null): string => {
    if (!q) return 'null';
    if ('path' in q) { // It's a CollectionReference
        return q.path;
    }
    // It's a Query
    const queryParts: string[] = [(q as any)._query.path.segments.join('/')];
    if ((q as any)._query.filters) {
        (q as any)._query.filters.forEach((f: any) => {
            queryParts.push(`${f.field.segments.join('.')}${f.op}${f.value}`);
        });
    }
    return queryParts.join('|');
};


export function useCollection<T>(q: Query<T> | null): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create a stable key from the query object to use in useEffect dependencies
  const queryKey = getQueryKey(q);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      setData([]);
      return;
    }
    
    // Set loading to true whenever the query changes
    setLoading(true);

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
            // Firestore queries have a private `_query` property. This is not stable API,
            // but it's one of the few ways to get the path for debugging.
            const internalQuery = (q as any)._query;
            if (internalQuery && internalQuery.path) {
                path = internalQuery.path.segments.join('/');
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
  // We use the stable queryKey as a dependency now
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { data, loading, error };
}

