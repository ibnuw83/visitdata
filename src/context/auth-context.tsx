'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginAction, logout as logoutAction, getSessionUser } from '@/app/auth-actions';
import { User } from '@/lib/types';

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
    const checkUser = async () => {
      try {
        const sessionUser = await getSessionUser();
        setUser(sessionUser);
      } catch (e) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const result = await loginAction(formData);
    if (result) {
      setUser(result);
      router.push('/dashboard');
    } else {
      setError('Email atau kata sandi tidak valid.');
    }
    setIsLoading(false);
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
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
