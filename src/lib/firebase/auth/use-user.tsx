
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
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClaimsLoading, setClaimsLoading] = useState(true);
  
  useEffect(() => {
    if (!authUser) {
      setIsAdmin(false);
      setClaimsLoading(false);
      return;
    }
    
    setClaimsLoading(true);
    getIdTokenResult(authUser)
      .then((idTokenResult) => {
        const claims = idTokenResult.claims;
        setIsAdmin(claims.role === 'admin');
      })
      .catch((error) => {
        console.error("Failed to get user claims:", error);
        setIsAdmin(false);
      })
      .finally(() => {
        setClaimsLoading(false);
      });

  }, [authUser]);

  const isLoading = isAuthLoading || isAppUserLoading || isClaimsLoading;

  return {
    user: authUser,
    appUser: appUser,
    isUserAdmin: isAdmin,
    isLoading: isLoading,
    logout
  };
};
