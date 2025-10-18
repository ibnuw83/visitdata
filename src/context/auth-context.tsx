
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

import type { User, UnlockRequest } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: User | null; // This will hold the firestore user data
  login: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  pendingRequestsCount: number;
  refreshPendingRequests: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const router = useRouter();
  const firestore = useFirestore();
  
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && firestore) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userDoc = userDocSnap.data() as User;
            userDoc.uid = userDocSnap.id;
            setAppUser(userDoc);
        } else {
            setAppUser(null);
            console.warn(`User document not found for UID: ${firebaseUser.uid}`);
        }
      } else {
        setAppUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const refreshPendingRequests = useCallback(async () => {
    if (appUser && appUser.role === 'admin' && firestore) {
      const requestsQuery = query(collection(firestore, 'unlock-requests'), where('status', '==', 'pending'));
      const snapshot = await getDocs(requestsQuery);
      setPendingRequestsCount(snapshot.size);
    } else {
        setPendingRequestsCount(0);
    }
  }, [appUser, firestore]);

  useEffect(() => {
    refreshPendingRequests();
  }, [refreshPendingRequests]);


  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle setting the user and appUser states
      // and then redirect.
      router.push('/dashboard');
    } catch (e: any) {
      console.error("Login Error:", e);
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('Email atau kata sandi salah.');
      } else {
        setError(e.message || 'Terjadi kesalahan saat login.');
      }
       setIsLoading(false);
    } 
    // Do not set loading to false here, let the listener handle it
  };

  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
    setUser(null);
    setPendingRequestsCount(0);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, appUser, login, logout, isLoading, error, pendingRequestsCount, refreshPendingRequests }}>
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
