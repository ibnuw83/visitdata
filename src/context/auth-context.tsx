
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { createSessionForUser, logout as logoutAction } from '@/app/auth-actions';
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
    (async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        
        if (!res.ok) {
            throw new Error('Failed to fetch session');
        }

        const serverSessionUser = await res.json();

        if (serverSessionUser) {
          const allClientUsers = getUsers();
          const clientUser = allClientUsers.find(u => u.uid === serverSessionUser.uid);
          
          if(clientUser) {
            setUser(clientUser);
          } else {
            await logoutAction();
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
    })();
  }, []);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            setError("Email dan kata sandi harus diisi.");
            setIsLoading(false);
            return;
        }
        
        // Client-side validation against localStorage data
        const allClientUsers = getUsers();
        const foundUser = allClientUsers.find(u => u.email === email);

        if (foundUser && foundUser.password === password) {
            // If credentials are correct, create a server session cookie
            await createSessionForUser(foundUser.uid);
            setUser(foundUser);
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
    router.push('/');
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
