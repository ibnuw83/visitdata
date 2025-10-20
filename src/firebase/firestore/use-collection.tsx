'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { onSnapshot, Query } from 'firebase/firestore';

type UseCollectionReturn<T> = {
  data: T[];
  loading: boolean;
  error: Error | null;
  setData: Dispatch<SetStateAction<T[]>>;
};

export function useCollection<T>(
  q: Query | null
): UseCollectionReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      setData([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(result);
        setLoading(false);
      },
      (err: any) => {
        console.error("useCollection error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [q]); // Dependency array now correctly references the query itself

  return { data, loading, error, setData };
}
