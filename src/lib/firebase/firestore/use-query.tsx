
'use client';

import { useState, useEffect } from 'react';
import { getDocs, Query } from 'firebase/firestore';

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
      setError(null);
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
        if (isMounted) {
          console.error(err);
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
