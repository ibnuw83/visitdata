
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginAction, logout as logoutAction } from '@/app/auth-actions';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/local-data-service';

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
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
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        
        if (res.ok) {
            const serverSession = await res.json();
            if (serverSession && serverSession.uid) {
              const allClientUsers = getUsers();
              const clientUser = allClientUsers.find(u => u.uid === serverSession.uid);
              
              if (clientUser) {
                const { password: _, ...userToSet } = clientUser;
                setUser(userToSet); 
              } else {
                await logoutAction();
                setUser(null);
              }
            } else {
              setUser(null);
            }
        } else {
            setUser(null);
        }
      } catch (e) {
        console.error("Session check failed:", e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginAction(formData);

      if (result.success && result.user) {
        setUser(result.user);
        router.push('/dashboard');
      } else {
        setError(result.error || 'Terjadi kesalahan yang tidak diketahui.');
      }
    } catch (e: any) {
      console.error("Login Error:", e);
      setError(e.message || 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, error }}>
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
