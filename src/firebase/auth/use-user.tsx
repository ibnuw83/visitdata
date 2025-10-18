'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useAuth, useDoc, useFirestore } from '..';
import { User as AppUser } from '@/lib/types';

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = authUser ? doc(firestore, 'users', authUser.uid) : null;
  const { data: appUser, loading: userLoading, error } = useDoc<AppUser>(userDocRef);

  return {
    user: appUser,
    loading: loading || userLoading,
    error,
    authUser,
  };
};
