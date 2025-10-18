
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirebaseApp, useFirestore } from '@/firebase/client-provider';
import { getDocs, collection, setDoc, doc, writeBatch, query, limit, getDoc, collectionGroup } from 'firebase/firestore';
import { users as seedUsers, destinations as seedDestinations, categories as seedCategories, visitData as seedVisitData, countries as seedCountries } from '@/lib/seed';
import { User as AppUser, Destination, Category, Country, VisitData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
        if (!firestore || !firebaseApp || !isInitializing) return;

        try {
            const adminUserDocRef = doc(firestore, 'users', 'admin-01');
            const adminDoc = await getDoc(adminUserDocRef);

            if (!adminDoc.exists()) {
                console.log("Memulai proses seeding data awal...");
                toast({ title: "Setup Awal", description: "Mengisi database dengan data contoh. Ini mungkin butuh beberapa saat..." });

                const authInstance = getAuth(firebaseApp);

                // Create all auth users first
                for (const userData of seedUsers) {
                    try {
                        await createUserWithEmailAndPassword(authInstance, userData.email, userData.password as string);
                    } catch (e: any) {
                        if (e.code !== 'auth/email-already-in-use') {
                            throw e; // Rethrow other auth errors
                        }
                        console.log(`Pengguna Auth ${userData.email} sudah ada.`);
                    }
                }
                console.log("Seeding pengguna di Auth selesai.");

                // Now, batch write all firestore documents
                const batch = writeBatch(firestore);

                seedUsers.forEach(userData => {
                    const { password, ...firestoreUser } = userData;
                    batch.set(doc(firestore, 'users', firestoreUser.uid), firestoreUser);
                });
                
                seedDestinations.forEach((d: Destination) => batch.set(doc(firestore, 'destinations', d.id), d));
                seedCategories.forEach((c: Category) => batch.set(doc(firestore, 'categories', c.id), c));
                seedCountries.forEach((c: Country) => batch.set(doc(firestore, 'countries', c.code), c));
                seedVisitData.forEach((vd: VisitData) => {
                    const visitDocRef = doc(firestore, 'destinations', vd.destinationId, 'visits', vd.id);
                    batch.set(visitDocRef, vd);
                });

                console.log("Mempersiapkan batch untuk semua data Firestore...");
                await batch.commit();
                console.log("Seeding semua data Firestore berhasil.");

                toast({
                    title: "Setup Selesai",
                    description: "Data contoh telah berhasil dimuat ke database."
                });

            } else {
                 console.log("Data sudah ada, proses seeding dilewati.");
            }

        } catch(e: any) {
            console.error("Galat kritis saat proses seeding data:", e);
            const description = e.message || 'Terjadi kesalahan tidak terduga saat inisialisasi data.';
            
            // Check if it's a permission error and emit it
            if (e.code === 'permission-denied' || e.name === 'FirebaseError' && e.message.includes('permission')) {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: '/ (batch operation)',
                    operation: 'write',
                    requestResourceData: { operation: 'initial seed' }
                }, description));
            }

            toast({
                variant: 'destructive',
                title: 'Gagal Melakukan Seeding',
                description: description
            });
            
        } finally {
            setIsInitializing(false); 
        }
    };

    if (firestore && firebaseApp) {
        seedInitialData();
    } else {
        // Ensure initialization stops if firebase/firestore aren't ready
        setIsInitializing(false);
    }
  }, [firestore, firebaseApp, toast, isInitializing]);


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

    