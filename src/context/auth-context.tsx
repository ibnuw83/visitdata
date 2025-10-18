
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirebaseApp, useFirestore } from '@/firebase/client-provider';
import { getDocs, collection, setDoc, doc, writeBatch, query, limit, getDoc, collectionGroup } from 'firebase/firestore';
import { users as seedUsers, destinations as seedDestinations, categories as seedCategories, visitData as seedVisitData, countries as seedCountries } from '@/lib/seed';
import { User as AppUser, Destination, Category, Country, VisitData } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
            const usersCollectionRef = collection(firestore, 'users');
            const q = query(usersCollectionRef, limit(1));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log("Memulai proses seeding data awal...");
                toast({ title: "Setup Awal", description: "Mengisi database dengan data contoh. Ini mungkin butuh beberapa saat..." });

                const authInstance = getAuth(firebaseApp);
                const userCreationPromises = seedUsers.map(async (userData, index) => {
                    try {
                        const userCredential = await createUserWithEmailAndPassword(authInstance, userData.email, userData.password as string);
                        const newAuthUser = userCredential.user;
                        const newUserDoc: AppUser = {
                            ...userData,
                            uid: newAuthUser.uid, 
                            avatarUrl: userData.avatarUrl || PlaceHolderImages[index % PlaceHolderImages.length].imageUrl,
                        };
                        delete (newUserDoc as any).password;
                        await setDoc(doc(firestore, 'users', newAuthUser.uid), newUserDoc);
                    } catch (e: any) {
                        if (e.code === 'auth/email-already-in-use') {
                            console.log(`Pengguna ${userData.email} sudah ada di Auth. Hanya memastikan data Firestore ada.`);
                            const userDocRef = doc(firestore, 'users', userData.uid);
                             if (!(await getDoc(userDocRef)).exists()) {
                                const docData = {...userData};
                                delete (docData as any).password;
                                await setDoc(userDocRef, docData);
                             }
                        } else {
                            throw e;
                        }
                    }
                });

                await Promise.all(userCreationPromises);
                console.log("Seeding pengguna selesai.");

                const mainBatch = writeBatch(firestore);
                seedDestinations.forEach((d: Destination) => mainBatch.set(doc(firestore, 'destinations', d.id), d));
                seedCategories.forEach((c: Category) => mainBatch.set(doc(firestore, 'categories', c.id), c));
                seedCountries.forEach((c: Country) => mainBatch.set(doc(firestore, 'countries', c.code), c));
                console.log("Mempersiapkan batch untuk destinasi, kategori, dan negara...");
                try {
                    await mainBatch.commit();
                    console.log("Seeding destinasi, kategori, dan negara berhasil.");
                } catch(batchError: any) {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: '/ (batch operation)',
                        operation: 'create',
                        requestResourceData: {
                            destinations: seedDestinations.length,
                            categories: seedCategories.length,
                            countries: seedCountries.length,
                        }
                    }, batchError.message));
                    throw batchError;
                }

                const visitBatch = writeBatch(firestore);
                seedVisitData.forEach((vd: VisitData) => {
                    const singleVisitDocRef = doc(firestore, 'destinations', vd.destinationId, 'visits', vd.id);
                    visitBatch.set(singleVisitDocRef, vd);
                });
                console.log("Mempersiapkan batch untuk data kunjungan...");
                try {
                    await visitBatch.commit();
                    console.log("Seeding data kunjungan berhasil.");
                } catch(batchError: any) {
                     errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: '/destinations/{destId}/visits (batch operation)',
                        operation: 'create',
                        requestResourceData: { visits: seedVisitData.length }
                    }, batchError.message));
                    throw batchError;
                }
                

                toast({
                    title: "Setup Selesai",
                    description: "Data contoh telah berhasil dimuat ke database."
                });
            } else {
                 console.log("Data sudah ada, proses seeding dilewati.");
            }

        } catch(e: any) {
            console.error("Galat kritis saat proses seeding data:", e);
            if (!(e instanceof FirestorePermissionError)) {
                 toast({
                    variant: 'destructive',
                    title: 'Gagal Melakukan Seeding',
                    description: e.message || 'Terjadi kesalahan tidak terduga saat inisialisasi data.'
                });
            }
        } finally {
            setIsInitializing(false); 
        }
    };

    if (firestore && firebaseApp && isInitializing) {
        seedInitialData();
    } else if (!isInitializing && (!firestore || !firebaseApp)) {
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
