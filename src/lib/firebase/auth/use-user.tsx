
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/firebase';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';
import { getIdTokenResult } from 'firebase/auth';

export const useUser = () => {
  const { user: authUser, isLoading: isAuthLoading, logout } = useAuthUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
      if (!authUser?.uid || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser?.uid, firestore]);

  const { data: appUser, loading: isAppUserLoading } = useDoc<AppUser>(userDocRef);
  
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  useEffect(() => {
    if (!authUser) {
      setIsUserAdmin(false);
      return;
    }

    // Force refresh of the token to get the latest custom claims.
    getIdTokenResult(authUser, true)
      .then((idTokenResult) => {
        const claims = idTokenResult.claims;
        setIsUserAdmin(claims.role === 'admin');
      })
      .catch((e) => {
        console.error("Failed to get user claims:", e);
        setIsUserAdmin(false);
      });
  }, [authUser]);

  const isLoading = isAuthLoading || isAppUserLoading;

  return {
    user: authUser,
    appUser: appUser,
    isUserAdmin: isUserAdmin,
    isLoading: isLoading,
    logout
  };
};
