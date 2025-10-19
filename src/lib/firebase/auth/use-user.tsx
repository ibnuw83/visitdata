
'use client';

import { useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '../client-provider';
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

  // The isLoading flag is true if the initial auth check is running,
  // OR if we have an authUser but are still waiting for the Firestore profile.
  // This provides a single, reliable loading state for the entire user object.
  const isLoading = isAuthLoading || (!!authUser && isAppUserLoading);

  return {
    user: authUser,
    appUser: appUser,
    isLoading: isLoading,
    error,
  };
};
