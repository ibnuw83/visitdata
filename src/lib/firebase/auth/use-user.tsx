
'use client';

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '../client-provider';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';

export const useUser = () => {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemo(() => {
      if (!authUser?.uid || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser?.uid, firestore]);
  
  const { data: appUser, loading: loadingUser, error } = useDoc<AppUser>(userDocRef);

  const isLoading = loadingAuth || (!!authUser && loadingUser);

  return {
    user: authUser,
    appUser: appUser,
    isLoading: isLoading,
    error,
  };
};
