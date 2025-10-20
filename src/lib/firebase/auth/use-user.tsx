
'use client';

import { useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/app/providers';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';

export const useUser = () => {
  const { user: authUser, isLoading: isAuthLoading, logout } = useAuthUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
      if (!authUser?.uid || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser?.uid, firestore]);
  
  const { data: appUser, loading: isAppUserLoading, error } = useDoc<AppUser>(userDocRef);

  // isLoading is true if auth is still initializing OR if we have an auth user but NOT a firestore profile yet.
  const isLoading = isAuthLoading || (!!authUser && !appUser);

  return {
    user: authUser,
    appUser: appUser,
    isLoading: isLoading,
    error,
    logout
  };
};
