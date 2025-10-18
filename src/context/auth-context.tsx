
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirebaseApp, useFirestore } from '@/firebase/client-provider';
import { getDocs, collection, setDoc, doc, writeBatch, query, limit } from 'firebase/firestore';
import { users as seedUsers, destinations as seedDestinations, categories as seedCategories, visitData as seedVisitData, countries as seedCountries } from '@/lib/seed';
import { User as AppUser } from '@/lib/types';
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
  const [isInitializing, setIsInitializing] = useState(true); // New state for seeding
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
            let seeded = false;

            // --- Seed Users ---
            const usersCollection = collection(firestore, 'users');
            const usersSnapshot = await getDocs(query(usersCollection, limit(1)));
            if (usersSnapshot.empty) {
                console.log("Seeding initial users...");
                seeded = true;
                const authInstance = getAuth(firebaseApp);
                for (const userData of seedUsers) {
                    try {
                        if (!userData.email || !userData.password) continue;
                        const userCredential = await createUserWithEmailAndPassword(authInstance, userData.email, userData.password);
                        const newAuthUser = userCredential.user;

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
                    } catch (e: any) {
                        if (e.code !== 'auth/email-already-in-use') {
                            console.error("Error seeding user:", userData.email, e);
                        } else {
                            console.log(`User ${userData.email} already exists in Auth, skipping Auth creation.`);
                             // If user exists in Auth but not Firestore, maybe add them to Firestore.
                            const existingUser = users.find(u => u.email === userData.email);
                            if (existingUser) {
                               await setDoc(doc(firestore, 'users', existingUser.uid), {
                                name: userData.name,
                                email: userData.email,
                                role: userData.role,
                                assignedLocations: userData.assignedLocations || [],
                                status: userData.status,
                                avatarUrl: userData.avatarUrl || PlaceHolderImages[0].imageUrl,
                                uid: existingUser.uid
                               }, { merge: true });
                            }
                        }
                    }
                }
            }

            // --- Seed Destinations, Categories, Countries ---
            const destinationsCollection = collection(firestore, 'destinations');
            const destSnapshot = await getDocs(query(destinationsCollection, limit(1)));
            if (destSnapshot.empty) {
                console.log("Seeding destinations, categories, countries...");
                seeded = true;
                const batch = writeBatch(firestore);
                seedDestinations.forEach(d => batch.set(doc(firestore, 'destinations', d.id), d));
                seedCategories.forEach(c => batch.set(doc(firestore, 'categories', c.id), c));
                seedCountries.forEach(c => batch.set(doc(firestore, 'countries', c.code), c));
                await batch.commit();
            }
            
            // --- Seed Visit Data ---
            // Check a specific, known visit entry to see if seeding is needed.
            const visitDocRef = doc(firestore, 'destinations/dest-01/visits/dest-01-2023-1');
            const visitsSnapshot = await getDocs(query(collectionGroup(firestore, 'visits'), limit(1)));
            if(visitsSnapshot.empty) {
                console.log("Seeding visit data...");
                seeded = true;
                const batch = writeBatch(firestore);
                seedVisitData.forEach(vd => {
                    const singleVisitDocRef = doc(firestore, 'destinations', vd.destinationId, 'visits', vd.id);
                    batch.set(singleVisitDocRef, vd);
                });
                await batch.commit();
            }

            if (seeded) {
                toast({
                    title: "Data Awal Dimuat",
                    description: "Database telah diisi dengan data contoh untuk memulai."
                });
            }
        } catch(e) {
            console.error("Critical error during data seeding:", e);
        } finally {
            setIsInitializing(false); // Set initializing to false after seeding is done or failed
        }
    };

    if (firestore && firebaseApp && isInitializing) { // Only run if initializing
        seedInitialData();
    } else if (!firestore || !firebaseApp) {
        setIsInitializing(false); // Can't seed, so stop initializing
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
