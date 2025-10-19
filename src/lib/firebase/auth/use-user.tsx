
'use client';

import { useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/app/provider';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';

export const useUser = () => {
  const { user: authUser, isLoading: isAuthLoading } = useAuthUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
      if (!authUser?.uid || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser?.uid, firestore]);
  
  const { data: appUser, loading: isAppUserLoading, error } = useDoc<AppUser>(userDocRef);

  // isLoading is true if the initial auth check is running,
  // OR if we have an authenticated user but their Firestore profile has not yet loaded.
  const isLoading = isAuthLoading || (!!authUser && !appUser);

  return {
    user: authUser,
    appUser: appUser,
    isLoading: isLoading,
    error,
  };
};
