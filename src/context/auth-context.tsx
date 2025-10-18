
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';

import type { User, UnlockRequest } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  pendingRequestsCount: number;
  refreshPendingRequests: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: appUser, loading: userLoading } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const router = useRouter();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();

  useEffect(() => {
    setUser(appUser);
    setIsLoading(userLoading);
  }, [appUser, userLoading]);
  
  const refreshPendingRequests = useCallback(async () => {
    if (user && user.role === 'admin' && firestore) {
      const requestsQuery = query(collection(firestore, 'unlock-requests'), where('status', '==', 'pending'));
      const snapshot = await getDocs(requestsQuery);
      setPendingRequestsCount(snapshot.size);
    }
  }, [user, firestore]);

  useEffect(() => {
    refreshPendingRequests();
  }, [refreshPendingRequests]);


  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const auth = getAuth(firebaseApp);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: any) {
      console.error("Login Error:", e);
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('Email atau kata sandi salah.');
      } else {
        setError(e.message || 'Terjadi kesalahan saat login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    setUser(null);
    setPendingRequestsCount(0);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, error, pendingRequestsCount, refreshPendingRequests }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
