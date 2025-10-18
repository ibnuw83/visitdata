
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

  useEffect(() => {
    // Immediately Invoked Function Expression (IIFE) to run async code in useEffect
    (async () => {
      try {
        // First, try a quick sync restore from localStorage to prevent UI flicker
        const storedUserJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedUserJson) {
          setUser(JSON.parse(storedUserJson));
        }

        // Then, verify with the server
        const sessionUser = await getSessionUser();
        if (sessionUser) {
          setUser(sessionUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionUser));
        } else {
          // If server has no session, clear client state
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Session check failed", e);
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } finally {
        // THIS IS CRITICAL: Always set loading to false after the check is complete.
        setIsLoading(false);
      }
    })();
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
