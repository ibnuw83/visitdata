
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/lib/firebase/client-provider';
import { AuthError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

interface AuthContextType {
  user: FirebaseUser | null;
  login: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, the onAuthStateChanged listener will handle the user state
      // and the layout effect will handle the redirect.
    } catch (e: any) {
      console.error("Login Error:", e);
      // Emit a structured error for the global listener
      const authError = new AuthError(e.code, e.message);
      errorEmitter.emit('auth-error', authError);
      
      // We can still set a local error if needed for inline messages
      setError('Email atau kata sandi salah.');
    } finally {
       setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error, isInitializing }}>
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
