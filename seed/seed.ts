import type { Firestore } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';
import { User } from '../src/lib/types';
import { seedUsers, seedCategories, seedDestinations, seedCountries, generateSeedVisitData } from './seed-data';

// Helper function to create or update a user and return their UID.
async function ensureAuthUser(adminAuth: AdminAuth, user: Omit<User, 'uid'>, password: string): Promise<string> {
    try {
        const userRecord = await adminAuth.getUserByEmail(user.email);
        console.log(`Updating existing user: ${user.email}`);
        await adminAuth.updateUser(userRecord.uid, {
            password: password,
            displayName: user.name,
            photoURL: user.avatarUrl,
        });
        return userRecord.uid;
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.log(`Creating new user: ${user.email}`);
            const userRecord = await adminAuth.createUser({
                email: user.email,
                password: password,
                displayName: user.name,
                photoURL: user.avatarUrl,
            });
            return userRecord.uid;
        }
        // Re-throw other errors
        throw error;
    }
}

export async function seedDatabase(adminDb: Firestore, adminAuth: AdminAuth) {
    if (!adminAuth || !adminDb) {
        throw new Error('Firebase Admin not initialized.');
    }

    console.log('--- Starting Database Seeding ---');

    // Step 1: Ensure all auth users exist and get their UIDs.
    console.log('Step 1: Ensuring authentication users exist...');
    const usersWithUids: User[] = [];
    const password = "password123";
    for (const user of seedUsers) {
        const uid = await ensureAuthUser(adminAuth, user, password);
        usersWithUids.push({ ...user, uid });
    }
    console.log(`Successfully created/updated ${usersWithUids.length} auth users.`);

    // Step 2: Set custom claims for all users.
    console.log('Step 2: Setting custom user claims...');
    for (const user of usersWithUids) {
        await adminAuth.setCustomUserClaims(user.uid, { role: user.role });
    }
    console.log('Successfully set custom claims.');
    
    // Step 3: Prepare all Firestore writes in a single batch.
    console.log('Step 3: Preparing Firestore batch write...');
    const batch = adminDb.batch();

    // Destinations
    const seededDestinations: (typeof seedDestinations[0] & { id: string })[] = [];
    for (const destination of seedDestinations) {
      const slug = destination.name.toLowerCase().replace(/\s+/g, '-');
      const docRef = adminDb.collection('destinations').doc(slug);
      const destWithId = { ...destination, id: docRef.id };
      batch.set(docRef, destWithId, { merge: true });
      seededDestinations.push(destWithId);
    }
    console.log(`- Queued ${seededDestinations.length} destinations.`);

    // User Profiles
    for (const user of usersWithUids) {
        const assignedLocationsIds = user.role === 'pengelola' 
            ? user.assignedLocations.map(slug => seededDestinations.find(d => d.id === slug)?.id).filter(Boolean) as string[]
            : [];
        
        const userRef = adminDb.collection('users').doc(user.uid);
        batch.set(userRef, { ...user, assignedLocations: assignedLocationsIds }, { merge: true });
    }
    console.log(`- Queued ${usersWithUids.length} user profiles.`);

    // Categories
    for (const category of seedCategories) {
        const docRef = adminDb.collection('categories').doc(category.name);
        batch.set(docRef, { ...category, id: docRef.id }, { merge: true });
    }
    console.log(`- Queued ${seedCategories.length} categories.`);
    
    // Countries
    seedCountries.forEach(country => {
        const docRef = adminDb.collection('countries').doc(country.code);
        batch.set(docRef, country, { merge: true });
    });
    console.log(`- Queued ${seedCountries.length} countries.`);

    // Visit Data
    const visitData = generateSeedVisitData(seededDestinations);
    visitData.forEach(visit => {
        const docRef = adminDb.collection('destinations').doc(visit.destinationId).collection('visits').doc(visit.id);
        batch.set(docRef, visit, { merge: true }); // Use merge to be non-destructive
    });
    console.log(`- Queued ${visitData.length} visit data documents.`);

    // App Settings
    const settingsRef = adminDb.collection('settings').doc('app');
    batch.set(settingsRef, {
        appTitle: 'VisitData Hub',
        logoUrl: '',
        footerText: `Hak Cipta © ${new Date().getFullYear()} Dinas Pariwisata`,
        heroTitle: 'Pusat Data Pariwisata Modern Anda',
        heroSubtitle: 'Kelola, analisis, dan laporkan data kunjungan wisata dengan mudah dan efisien. Berdayakan pengambilan keputusan berbasis data untuk pariwisata daerah Anda.'
    }, { merge: true });
    console.log('- Queued app settings.');

    // Step 4: Commit the batch.
    console.log('Step 4: Committing batch to Firestore...');
    await batch.commit();
    console.log('Batch committed successfully.');

    console.log('--- Database Seeding Completed ---');
    
     return {
      users: usersWithUids.length,
      categories: seedCategories.length,
      destinations: seedDestinations.length,
      countries: seedCountries.length,
      visits: visitData.length,
    };
}
