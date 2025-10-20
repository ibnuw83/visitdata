'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference } from 'firebase/firestore';

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
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as T) : null);
        setLoading(false);
      },
      (err: Error) => {
        console.error(`useDoc error on path: ${ref.path}`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [ref]); // Dependency array now correctly references the document reference

  return { data, loading, error };
}
