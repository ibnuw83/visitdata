
'use client';

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '../client-provider';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';

export const useUser = () => {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [authUser, setAuthUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemo(() => {
      if (!authUser || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser, firestore]);
  
  const { data: appUser, loading: userLoading, error } = useDoc<AppUser>(userDocRef);

  return {
    user: authUser,
    appUser: appUser,
    loading: loading || userLoading,
    error,
  };
};
