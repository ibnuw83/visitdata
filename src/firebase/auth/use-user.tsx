'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { User as AppUserType } from '@/lib/types';
import { getIdTokenResult, User } from 'firebase/auth';

// Define a richer user object that includes the auth user and firestore profile data
export type MergedUser = AppUserType & {
  // Explicitly include properties from Firebase Auth User if needed, e.g., emailVerified
  emailVerified: boolean;
};

export const useUser = () => {
  const { user: authUser, isLoading: isAuthLoading, logout } = useAuthUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemo(() => {
    if (!authUser?.uid || !firestore) return null;
    return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUserType>;
  }, [authUser?.uid, firestore]);

  const { data: appUser, loading: isAppUserLoading } = useDoc<AppUserType>(userDocRef);
  
  const [claims, setClaims] = useState<{ [key: string]: any } | null>(null);
  const [isClaimsLoading, setClaimsLoading] = useState(true);
  
  useEffect(() => {
    if (!authUser) {
      setClaims(null);
      setClaimsLoading(false);
      return;
    }
    
    setClaimsLoading(true);
    getIdTokenResult(authUser, true) // Force refresh the token to get latest claims
      .then((idTokenResult) => {
        setClaims(idTokenResult.claims);
      })
      .catch((error) => {
        console.error("Failed to get user claims:", error);
        setClaims(null); // On error, reset claims
      })
      .finally(() => {
        setClaimsLoading(false);
      });

  }, [authUser]);

  const isLoading = isAuthLoading || isAppUserLoading || isClaimsLoading;
  
  // Combine authUser and Firestore appUser into one object
  const mergedUser = useMemo(() => {
      if (isLoading || !authUser || !appUser) return null;

      // Prioritize role from token claims, fallback to firestore doc
      const finalRole = claims?.role || appUser.role;

      return {
          ...authUser, // from 'firebase/auth'
          ...appUser,  // from 'firestore' collection
          role: finalRole,
      } as MergedUser;
  }, [authUser, appUser, isLoading, claims])


  return {
    user: authUser, // The raw firebase auth user
    appUser: mergedUser, 
    isUserAdmin: mergedUser?.role === 'admin',
    isLoading: isLoading,
    logout
  };
};
