
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, DocumentReference } from 'firebase/firestore';
import { useAuthUser, useFirestore } from '@/app/providers';
import { useDoc } from '../firestore/use-doc';
import { User as AppUser } from '@/lib/types';

export const useUser = () => {
  const { user: authUser, isLoading: isAuthLoading, logout } = useAuthUser();
  const firestore = useFirestore();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  const userDocRef = useMemo(() => {
      if (!authUser?.uid || !firestore) return null;
      return doc(firestore, 'users', authUser.uid) as DocumentReference<AppUser>;
  }, [authUser?.uid, firestore]);
  
  const { data: appUser, loading: isAppUserLoading, error } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    // This effect is now the primary source of truth for admin status.
    const checkAdminStatus = async () => {
      // If auth is still loading or there's no user, we can't check admin status yet.
      if (isAuthLoading || !authUser?.uid || !firestore) {
        setIsUserAdmin(false);
        // We set loading to false only if we are sure there is no user.
        if (!isAuthLoading && !authUser?.uid) {
          setIsAdminLoading(false);
        }
        return;
      }
      
      setIsAdminLoading(true);
      try {
        const adminDocRef = doc(firestore, 'admins', authUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsUserAdmin(adminDoc.exists());
      } catch (e) {
        console.error("Failed to check admin status:", e);
        setIsUserAdmin(false);
      } finally {
        setIsAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [authUser?.uid, firestore, isAuthLoading]);


  // The main isLoading state now primarily depends on auth and admin check.
  // The appUser profile loading is secondary and shouldn't block the main app layout.
  const isLoading = isAuthLoading || isAdminLoading;

  return {
    user: authUser,
    appUser: appUser,
    isUserAdmin: isUserAdmin, // Use the state derived from the /admins collection check.
    isLoading: isLoading,
    error,
    logout
  };
};
