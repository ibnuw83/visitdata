'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
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
        if (appUser) {
          // Manually add role to appUser from claims if not present
          // This helps bridge the gap if Firestore data is slightly out of sync
          if (!appUser.role && claims.role) {
            appUser.role = claims.role;
          }
        }
      })
      .catch((error) => {
        console.error("Failed to get user claims:", error);
        setIsAdmin(false);
      })
      .finally(() => {
        setClaimsLoading(false);
      });

  }, [authUser, appUser]);

  const isLoading = isAuthLoading || isAppUserLoading || isClaimsLoading;
  
  // Combine authUser and Firestore appUser into one object
  const mergedUser = useMemo(() => {
      if (!authUser || !appUser) return null;
      return {
          ...authUser, // from 'firebase/auth'
          ...appUser,  // from 'firestore' collection
          isAdmin: isAdmin
      }
  }, [authUser, appUser, isAdmin])


  return {
    user: authUser, // The raw firebase auth user
    appUser: mergedUser, // The combined user profile with data from firestore
    isUserAdmin: isAdmin,
    isLoading: isLoading,
    logout
  };
};
