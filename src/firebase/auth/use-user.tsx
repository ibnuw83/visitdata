'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { User as AppUserType } from '@/lib/types';
import { getIdTokenResult } from 'firebase/auth';

export const useUser = () => {
  const { user: authUser, isLoading: isAuthLoading, logout } = useAuthUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
    if (!authUser?.uid || !firestore) return null;
    return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUserType>;
  }, [authUser?.uid, firestore]);

  const { data: appUser, loading: isAppUserLoading } = useDoc<AppUserType>(userDocRef);
  
  const [role, setRole] = useState<string | null>(null);
  const [isClaimsLoading, setClaimsLoading] = useState(true);
  
  useEffect(() => {
    if (!authUser) {
      setRole(null);
      setClaimsLoading(false);
      return;
    }
    
    setClaimsLoading(true);
    getIdTokenResult(authUser)
      .then((idTokenResult) => {
        const claims = idTokenResult.claims;
        setRole(claims.role as string || null);
      })
      .catch((error) => {
        console.error("Failed to get user claims:", error);
        setRole(null);
      })
      .finally(() => {
        setClaimsLoading(false);
      });

  }, [authUser]);

  const isLoading = isAuthLoading || isAppUserLoading || isClaimsLoading;
  
  // Combine authUser and Firestore appUser into one object
  const mergedUser = useMemo(() => {
      if (isLoading || !authUser || !appUser) return null;
      return {
          ...authUser, // from 'firebase/auth'
          ...appUser,  // from 'firestore' collection
          role: role || appUser.role, // Prioritize claim role
      } as AppUserType & { isAdmin: boolean };
  }, [authUser, appUser, isLoading, role])


  return {
    user: authUser, // The raw firebase auth user
    appUser: mergedUser, 
    isUserAdmin: mergedUser?.role === 'admin',
    isLoading: isLoading,
    logout
  };
};
