
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
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        
        if (res.ok) {
            const serverSessionUser = await res.json();
            if (serverSessionUser && serverSessionUser.uid) {
              // The session cookie is valid, now get the definitive user data from client-side storage.
              const allClientUsers = getUsers();
              const clientUser = allClientUsers.find(u => u.uid === serverSessionUser.uid);
              
              if (clientUser) {
                setUser(clientUser); // Set user from localStorage
              } else {
                // User exists in session but not in client storage, likely stale. Log them out.
                await logoutAction();
                setUser(null);
              }
            } else {
              setUser(null);
            }
        } else {
            // If the API call fails (e.g. 404 if session is missing), assume no session
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
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            setError("Email dan kata sandi harus diisi.");
            setIsLoading(false);
            return;
        }
        
        // Client-side validation against localStorage data is the source of truth
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
      console.error("Login Error:", e);
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
