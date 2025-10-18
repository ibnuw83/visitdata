'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginAction, logout as logoutAction, getSessionUser } from '@/app/auth-actions';
import { User } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'visitdata.session';

interface AuthContextType {
  user: User | null;
  login: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // On initial mount, try to restore the session and verify with the server.
  useEffect(() => {
    let isMounted = true;
    const restoreAndVerifySession = async () => {
      setIsLoading(true);
      try {
        // First, try restoring from localStorage for an instant UI update.
        const storedUserJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson);
           if (isMounted) {
             setUser(storedUser);
           }
        }
        
        // Then, verify with the server in the background to ensure session is still valid.
        const sessionUser = await getSessionUser();
        if (isMounted) {
          if (sessionUser) {
              setUser(sessionUser);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionUser));
          } else {
              setUser(null);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      } catch (e) {
         if (isMounted) {
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
         }
      } finally {
         if (isMounted) {
            setIsLoading(false);
         }
      }
    };

    restoreAndVerifySession();
    
    return () => {
        isMounted = false;
    }
  }, []);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = await loginAction(formData);
        if (result) {
          setUser(result);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
          router.push('/dashboard');
        } else {
          setError('Email atau kata sandi tidak valid.');
        }
    } catch (e: any) {
        setError(e.message || 'Terjadi kesalahan saat login.');
    } finally {
        setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
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
