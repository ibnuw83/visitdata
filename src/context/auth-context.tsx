
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/auth-actions';
import { deleteSession } from '@/lib/session';
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
                await deleteSession();
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
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!email || !password) {
        setError("Email dan kata sandi harus diisi.");
        setIsLoading(false);
        return;
      }
      
      const allUsers = getUsers();
      const foundUser = allUsers.find(u => u.email === email);

      if (foundUser && foundUser.password === password) {
        // Validation successful on the client, now create the server session cookie
        const result = await loginAction(foundUser.uid);

        if (result.success) {
          const { password: _, ...userToSet } = foundUser;
          setUser(userToSet);
          router.push('/dashboard');
        } else {
           setError(result.error || 'Gagal membuat sesi server.');
        }

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
    await deleteSession();
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
