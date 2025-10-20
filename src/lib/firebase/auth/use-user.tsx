
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/app/providers';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';
import { getIdTokenResult } from 'firebase/auth';

export const useUser = () => {
  const { user: authUser, isLoading: isAuthLoading, logout } = useAuthUser();
  const firestore = useFirestore();

  // State for the Firestore user profile
  const userDocRef = useMemo(() => {
      if (!authUser?.uid || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser?.uid, firestore]);
  const { data: appUser, loading: isAppUserLoading, error } = useDoc<AppUser>(userDocRef);
  
  // State for custom claims (role)
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [claimsLoading, setClaimsLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setIsUserAdmin(false);
      setClaimsLoading(false);
      return;
    }

    setClaimsLoading(true);
    let isMounted = true;

    getIdTokenResult(authUser)
      .then((idTokenResult) => {
        if (isMounted) {
          const claims = idTokenResult.claims;
          setIsUserAdmin(claims.role === 'admin');
        }
      })
      .catch((e) => {
        if (isMounted) {
          console.error("Failed to get user claims:", e);
          setIsUserAdmin(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setClaimsLoading(false);
        }
      });
      
    return () => { isMounted = false; }
  }, [authUser]);

  // Overall loading is complete when auth is done AND claims are checked AND app user profile is loaded (or fails).
  const isLoading = isAuthLoading || claimsLoading || isAppUserLoading;

  return {
    user: authUser,
    appUser: appUser,
    isUserAdmin: isUserAdmin,
    isLoading: isLoading,
    error,
    logout
  };
};
