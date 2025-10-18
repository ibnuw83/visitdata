
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/lib/firebase/client-provider';
import { AuthError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { Logo } from '@/components/logo';

interface AuthContextType {
  user: FirebaseUser | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [auth]);


  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading: isInitializing, isInitializing }}>
      {isInitializing ? (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Logo className="h-10 w-10 animate-pulse" />
        </div>
      ) : children}
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
