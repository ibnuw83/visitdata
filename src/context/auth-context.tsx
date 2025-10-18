
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginAction, logout as logoutAction } from '@/app/auth-actions';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/local-data-service';

const LOCAL_STORAGE_KEY = 'visitdata.session';

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
        // Fetch server session status first
        const res = await fetch('/api/session', { cache: 'no-store' });
        
        if (!res.ok) {
            throw new Error('Failed to fetch session');
        }

        const serverSessionUser = await res.json();

        if (serverSessionUser) {
          // If server session exists, get the LATEST user data from client-side storage (localStorage)
          // This ensures we have the most up-to-date info (e.g., name changes)
          const allClientUsers = getUsers();
          const clientUser = allClientUsers.find(u => u.uid === serverSessionUser.uid);
          
          if(clientUser) {
            setUser(clientUser);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clientUser));
          } else {
            // User in session but not in client data, something is wrong. Log out.
            await logoutAction();
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }

        } else {
          // No server session, ensure client is logged out
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Session check failed:", e);
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginResult = await loginAction(formData);
      if (loginResult) {
        // After successful server login, get latest user data from client storage
        const allClientUsers = getUsers();
        const clientUser = allClientUsers.find(u => u.uid === loginResult.uid);

        if (clientUser) {
          setUser(clientUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clientUser));
          router.push('/dashboard');
        } else {
           setError('Pengguna tidak ditemukan setelah login.');
        }

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
