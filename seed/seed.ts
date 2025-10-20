import type { Firestore } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';
import { User } from '../src/lib/types';
import { seedUsers, seedCategories, seedDestinations, seedCountries, generateSeedVisitData } from './seed-data';

// Helper function to create or update a user and return their UID.
async function createAuthUser(adminAuth: AdminAuth, user: Omit<User, 'uid'>, password: string): Promise<string> {
    // Try to delete user first to ensure a clean state
    try {
        const existingUser = await adminAuth.getUserByEmail(user.email);
        console.log(`Deleting existing user: ${user.email} to ensure clean state.`);
        await adminAuth.deleteUser(existingUser.uid);
    } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
            throw error; // Re-throw errors that are not 'user-not-found'
        }
        // If user not found, that's good, we can proceed.
    }

    // Create the user
    console.log(`Creating new user: ${user.email}`);
    const userRecord = await adminAuth.createUser({
        email: user.email,
        password: password,
        displayName: user.name,
        photoURL: user.avatarUrl,
        emailVerified: true, // It's a trusted environment
    });
    
    // Set custom claims AFTER user is created
    console.log(`Setting custom claims for ${user.email}`);
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: user.role });
    
    return userRecord.uid;
}

export async function seedDatabase(adminDb: Firestore, adminAuth: AdminAuth) {
    if (!adminAuth || !adminDb) {
        throw new Error('Firebase Admin not initialized.');
    }

    console.log('--- Starting Database Seeding ---');

    // Step 1: Create all auth users and get their UIDs. This is now a "delete and recreate" operation.
    console.log('Step 1: Ensuring authentication users are created cleanly...');
    const usersWithUids: User[] = [];
    const password = "password123";
    for (const user of seedUsers) {
        const uid = await createAuthUser(adminAuth, user, password);
        usersWithUids.push({ ...user, uid });
    }
    console.log(`Successfully created ${usersWithUids.length} auth users.`);
    
    // Step 2: Prepare all Firestore writes in a single batch.
    console.log('Step 2: Preparing Firestore batch write...');
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

    // Step 3: Commit the batch.
    console.log('Step 3: Committing batch to Firestore...');
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
