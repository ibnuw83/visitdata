
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, logoutAction } from '@/app/auth-actions';
import { getUsers, resetAndSeedData, getUnlockRequests } from '@/lib/local-data-service';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  pendingRequestsCount: number;
  refreshPendingRequests: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A flag to ensure seeding only happens once per application lifecycle.
let hasSeeded = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const router = useRouter();
  
  const refreshPendingRequests = useCallback(() => {
    if (typeof window !== 'undefined') {
        const requests = getUnlockRequests();
        const pendingCount = requests.filter(req => req.status === 'pending').length;
        setPendingRequestsCount(pendingCount);
    }
  }, []);

  useEffect(() => {
    // This effect runs only once when the provider mounts.
    if (!hasSeeded) {
      resetAndSeedData();
      hasSeeded = true;
    }
    
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
                if (userToSet.role === 'admin') {
                  refreshPendingRequests();
                }
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
  }, [refreshPendingRequests]);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!email || !password) {
        throw new Error("Email dan kata sandi harus diisi.");
      }
      
      // 1. Validate credentials on the client side against fresh data
      const allUsers = getUsers();
      const foundUser = allUsers.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Email atau kata sandi tidak valid.');
      }
      
      const { uid } = foundUser;

      // 2. If valid, call server action to create a session cookie
      const sessionResult = await loginAction(uid);

      if (sessionResult.success) {
        // 3. Set user state in the client
        const { password: _, ...userToSet } = foundUser;
        setUser(userToSet);
        if (userToSet.role === 'admin') {
          refreshPendingRequests();
        }
        router.push('/dashboard');
      } else {
        throw new Error(sessionResult.error || 'Gagal membuat sesi server.');
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
    setPendingRequestsCount(0);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, error, pendingRequestsCount, refreshPendingRequests }}>
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
