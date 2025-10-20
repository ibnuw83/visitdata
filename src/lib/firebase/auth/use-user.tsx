
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
    const checkAdminStatus = async () => {
      if (!authUser?.uid || !firestore) {
        setIsAdminLoading(false);
        setIsUserAdmin(false);
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
  }, [authUser?.uid, firestore]);


  // isLoading is true if auth is still initializing OR if we have an auth user but NOT a firestore profile yet, OR we are still checking admin status.
  const isLoading = isAuthLoading || (!!authUser && !appUser) || isAdminLoading;

  // Add a specific check for the user's role from the appUser object once it's loaded.
  // This can override the isUserAdmin state if there are discrepancies.
  const finalIsAdmin = appUser?.role === 'admin' || isUserAdmin;

  return {
    user: authUser,
    appUser: appUser,
    isUserAdmin: finalIsAdmin,
    isLoading: isLoading,
    error,
    logout
  };
};
