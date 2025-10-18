
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
            const adminUserSeed = seedUsers.find(u => u.role === 'admin');
            if (!adminUserSeed) {
                console.error("Data seed admin tidak ditemukan.");
                return;
            }

            const adminUserDocRef = doc(firestore, 'users', adminUserSeed.uid);
            const adminUserDoc = await getDoc(adminUserDocRef);

            if (!adminUserDoc.exists()) {
                console.log("Memulai proses seeding data awal...");
                toast({ title: "Setup Awal", description: "Mengisi database dengan data contoh. Ini mungkin butuh beberapa saat..." });

                // 1. Seed Admin User
                const authInstance = getAuth(firebaseApp);
                try {
                    const userCredential = await createUserWithEmailAndPassword(authInstance, adminUserSeed.email, adminUserSeed.password as string);
                    const newAuthUser = userCredential.user;
                    
                    const newUserDoc: AppUser = {
                        uid: newAuthUser.uid, // Gunakan UID dari Auth
                        name: adminUserSeed.name,
                        email: adminUserSeed.email,
                        role: adminUserSeed.role,
                        assignedLocations: adminUserSeed.assignedLocations,
                        status: adminUserSeed.status,
                        avatarUrl: adminUserSeed.avatarUrl,
                    };
                    // Buat dokumen user dengan UID dari Auth
                    await setDoc(doc(firestore, 'users', newAuthUser.uid), newUserDoc);
                    console.log("Pengguna admin berhasil dibuat di Auth dan Firestore.");

                } catch (e: any) {
                    if (e.code === 'auth/email-already-in-use') {
                        console.log(`Pengguna admin ${adminUserSeed.email} sudah ada di Auth. Hanya membuat data Firestore.`);
                        // Jika sudah ada di Auth, tetap buat di Firestore dengan UID yang sudah ada
                         await setDoc(adminUserDocRef, {
                            uid: adminUserSeed.uid,
                            name: adminUserSeed.name,
                            email: adminUserSeed.email,
                            role: adminUserSeed.role,
                            assignedLocations: adminUserSeed.assignedLocations,
                            status: adminUserSeed.status,
                            avatarUrl: adminUserSeed.avatarUrl,
                        });
                    } else {
                        throw e; // Lemparkan galat lain
                    }
                }
                
                // 2. Seed data lainnya (destinations, categories, etc.)
                const batch = writeBatch(firestore);

                seedDestinations.forEach((d: Destination) => batch.set(doc(firestore, 'destinations', d.id), d));
                seedCategories.forEach((c: Category) => batch.set(doc(firestore, 'categories', c.id), c));
                seedCountries.forEach((c: Country) => batch.set(doc(firestore, 'countries', c.code), c));
                
                console.log("Seeding destinasi, kategori, dan negara...");
                await batch.commit();

                // 3. Seed Visit Data (dalam batch terpisah)
                const visitBatch = writeBatch(firestore);
                seedVisitData.forEach((vd: VisitData) => {
                    const singleVisitDocRef = doc(firestore, 'destinations', vd.destinationId, 'visits', vd.id);
                    visitBatch.set(singleVisitDocRef, vd);
                });
                console.log("Seeding data kunjungan...");
                await visitBatch.commit();
                
                // 4. Seed Pengguna Lain (Pengelola)
                 const managerUsers = seedUsers.filter(u => u.role === 'pengelola');
                 for (const managerData of managerUsers) {
                    try {
                        const userCredential = await createUserWithEmailAndPassword(authInstance, managerData.email, managerData.password as string);
                        const newAuthUser = userCredential.user;
                        const newUserDoc: AppUser = {
                            uid: newAuthUser.uid,
                            name: managerData.name,
                            email: managerData.email,
                            role: managerData.role,
                            assignedLocations: managerData.assignedLocations,
                            status: managerData.status,
                            avatarUrl: managerData.avatarUrl
                        };
                        await setDoc(doc(firestore, 'users', newAuthUser.uid), newUserDoc);
                    } catch(e: any) {
                        if (e.code !== 'auth/email-already-in-use') {
                            console.warn(`Gagal membuat pengguna pengelola ${managerData.email}:`, e.message);
                        } else {
                             console.log(`Pengguna pengelola ${managerData.email} sudah ada.`);
                             // Pastikan data Firestore ada jika auth sudah ada
                             const managerDocRef = doc(firestore, 'users', managerData.uid);
                             if (!(await getDoc(managerDocRef)).exists()) {
                                await setDoc(managerDocRef, {...managerData, uid: managerData.uid});
                             }
                        }
                    }
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
            toast({
                variant: 'destructive',
                title: 'Gagal Melakukan Seeding',
                description: e.message || 'Terjadi kesalahan tidak terduga saat inisialisasi data.'
            });
        } finally {
            setIsInitializing(false); 
        }
    };

    if (firestore && firebaseApp && isInitializing) {
        seedInitialData();
    } else if (!firestore || !firebaseApp) {
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
