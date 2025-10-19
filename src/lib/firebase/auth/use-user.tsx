
'use client';

import { useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '../client-provider';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';

export const useUser = () => {
  const { user: authUser, isLoading: loadingAuth } = useAuthUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
      if (!authUser?.uid || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser?.uid, firestore]);
  
  const { data: appUser, loading: loadingUser, error } = useDoc<AppUser>(userDocRef);

  // This is the crucial fix.
  // The overall loading state is true if:
  // 1. The initial auth check is running (loadingAuth is true).
  // 2. The auth check is done and we have an authUser, but we are still waiting
  //    for the corresponding Firestore user profile to load (loadingUser is true).
  const isLoading = loadingAuth || (!!authUser && loadingUser);

  return {
    user: authUser,
    appUser: appUser,
    isLoading: isLoading,
    error,
  };
};
