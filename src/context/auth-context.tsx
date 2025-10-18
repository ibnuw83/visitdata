
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirebaseApp, useFirestore } from '@/firebase/client-provider';
import { doc, getDoc } from 'firebase/firestore';
import { users as seedUsers } from '@/lib/seed';
import { useToast } from '@/hooks/use-toast';


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
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const seedInitialData = async () => {
        if (!firestore || !firebaseApp) return;

        try {
            // Kita hanya perlu memeriksa apakah pengguna admin sudah ada di Auth
            // untuk memicu pembuatan pengguna jika diperlukan.
            const authInstance = getAuth(firebaseApp);
            
            // Buat pengguna admin jika belum ada.
            try {
                await createUserWithEmailAndPassword(authInstance, seedUsers[0].email, seedUsers[0].password as string);
                console.log("Pengguna Auth Admin dibuat.");
            } catch (e: any) {
                if (e.code !== 'auth/email-already-in-use') {
                   throw e;
                }
                // Jika sudah ada, tidak masalah, kita lanjutkan.
                console.log("Pengguna Auth Admin sudah ada.");
            }
            
            // Sekarang, panggil API route untuk melakukan seeding data di server.
            // Ini akan memeriksa keberadaan data di Firestore dan melakukan seeding jika perlu.
            console.log("Memicu proses seeding data di server...");
            const response = await fetch('/api/seed', { method: 'POST' });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal melakukan seeding data.');
            }

            console.log("Respon dari server seeder:", result.message);
            
        } catch(e: any) {
            console.error("Galat kritis saat proses inisialisasi:", e);
            toast({
                variant: 'destructive',
                title: 'Gagal Inisialisasi Data',
                description: e.message || 'Terjadi kesalahan tidak terduga saat inisialisasi data.'
            });
        } finally {
            setIsInitializing(false); 
        }
    };

    seedInitialData();
    // Kita hanya ingin menjalankan ini sekali, jadi dependensi array dikosongkan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      console.error("Login Error:", e);
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('Email atau kata sandi salah.');
      } else {
        setError(e.message || 'Terjadi kesalahan saat login.');
      }
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
