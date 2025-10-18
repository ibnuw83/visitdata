
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirebaseApp, useFirestore } from '@/firebase/client-provider';
import { getDocs, collection, setDoc, doc } from 'firebase/firestore';
import { users as seedUsers } from '@/lib/seed';
import { User as AppUser } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  login: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    const seedInitialUsers = async () => {
        if (!firestore || !firebaseApp) return;

        // Check if the users collection is empty
        const usersCollection = collection(firestore, 'users');
        const snapshot = await getDocs(usersCollection);
        if (!snapshot.empty) {
            return;
        }

        console.log("Seeding initial users...");
        const auth = getAuth(firebaseApp);

        for (const userData of seedUsers) {
            try {
                if (!userData.email || !userData.password) continue;
                
                // 1. Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                const newAuthUser = userCredential.user;

                // 2. Create user profile in Firestore
                const newUserDoc: AppUser = {
                    uid: newAuthUser.uid,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    assignedLocations: userData.assignedLocations || [],
                    status: userData.status,
                    avatarUrl: userData.avatarUrl || PlaceHolderImages[0].imageUrl
                };
                
                await setDoc(doc(firestore, 'users', newAuthUser.uid), newUserDoc);
                 console.log(`Successfully seeded user: ${userData.name}`);
            } catch (e: any) {
                if (e.code === 'auth/email-already-in-use') {
                    console.warn(`User ${userData.email} already exists in Auth. Checking Firestore...`);
                } else {
                    console.error("Error seeding user:", userData.email, e);
                }
            }
        }
        toast({
            title: "Pengguna Awal Dibuat",
            description: "Pengguna default (admin & pengelola) telah ditambahkan ke sistem."
        });
    };

    if (firestore && firebaseApp) {
        seedInitialUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, firebaseApp]);


  const login = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user state.
      // Redirect will happen in the page/layout after user state is updated.
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

    