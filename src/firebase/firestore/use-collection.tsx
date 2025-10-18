
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  collectionGroup,
  QueryConstraint,
  Query,
} from 'firebase/firestore';
import { useFirestore } from '../client-provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions {
  group?: boolean;
}

export function useCollection<T>(
  path: string | null,
  constraints: QueryConstraint[] = [],
  options: UseCollectionOptions = {}
): { data: T[]; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  // Serialize constraints for stable dependency array
  const constraintsJSON = JSON.stringify(constraints.map(c => c.type));

  useEffect(() => {
    if (!path || !firestore) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    
    let q: Query;
    const collectionRef = options.group ? collectionGroup(firestore, path) : collection(firestore, path);
    q = query(collectionRef, ...constraints);

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
        
        let errorPath = path;
        try {
          if ('_query' in q && (q as any)._query.path) {
            errorPath = (q as any)._query.path.segments.join('/');
          }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, constraintsJSON, firestore, options.group]);

  return { data, loading, error };
}
