
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import {
  seedUsers,
  seedCategories,
  seedDestinations,
  seedCountries,
  generateSeedVisitData,
} from '@/lib/seed-data';
import type { Destination } from '@/lib/types';

export async function GET() {
  try {
    const auth = getAuth();
    const batch = adminDb.batch();

    console.log('Starting user authentication seeding...');
    
    // Create Auth users and collect their UIDs
    const userRecordsPromises = seedUsers.map(async (user) => {
        let uid: string;
        try {
            const existingUser = await auth.getUserByEmail(user.email);
            console.log(`User ${user.email} already exists. Using existing UID: ${existingUser.uid}`);
            uid = existingUser.uid;
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await auth.createUser({
                    email: user.email,
                    password: "password123",
                    displayName: user.name,
                    photoURL: user.avatarUrl,
                });
                console.log(`Successfully created new auth user: ${user.email} with UID: ${userRecord.uid}.`);
                uid = userRecord.uid;
            } else {
                // Re-throw other auth errors
                throw error;
            }
        }
        return { ...user, uid };
    });
    
    const usersWithUids = await Promise.all(userRecordsPromises);
    console.log('Finished auth user creation/retrieval.');

    // Seed Destinations first to get their IDs
    const seededDestinations: (Destination & { id: string })[] = [];
    seedDestinations.forEach(destination => {
      const slug = destination.name.toLowerCase().replace(/\s+/g, '-');
      const docRef = adminDb.collection('destinations').doc(slug);
      const destWithId = { ...destination, id: docRef.id };
      batch.set(docRef, destWithId);
      seededDestinations.push(destWithId);
    });
    console.log('Destinations queued for batch.');

    // Seed Firestore User Docs and Admins collection
    console.log('Seeding Firestore user documents and admin roles...');
    for (const user of usersWithUids) {
        const isPengelola = user.role === 'pengelola';
        
        const assignedLocationsIds = isPengelola 
            ? user.assignedLocations.map(slug => {
                const dest = seededDestinations.find(d => d.id === slug);
                return dest ? dest.id : null;
            }).filter((id): id is string => id !== null)
            : [];
        
        const userRef = adminDb.collection('users').doc(user.uid);
        batch.set(userRef, { ...user, assignedLocations: assignedLocationsIds });

        // If the user is an admin, add them to the 'admins' collection
        if (user.role === 'admin') {
            const adminRef = adminDb.collection('admins').doc(user.uid);
            batch.set(adminRef, { role: 'admin' });
            console.log(`User ${user.email} (${user.uid}) marked as admin.`);
        }
    }
    console.log('Finished queueing user documents and admin roles.');

    // Seed Categories
    seedCategories.forEach(category => {
      const docRef = adminDb.collection('categories').doc();
      batch.set(docRef, { ...category, id: docRef.id });
    });
    console.log('Categories queued for batch.');

    // Seed Countries
    seedCountries.forEach(country => {
        const docRef = adminDb.collection('countries').doc(country.code);
        batch.set(docRef, country);
    });
    console.log('Countries queued for batch.');

    // Seed Visit Data
    const visitData = generateSeedVisitData(seededDestinations);
    visitData.forEach(visit => {
        const docRef = adminDb.collection('destinations').doc(visit.destinationId).collection('visits').doc(visit.id);
        batch.set(docRef, visit);
    });
    console.log('Visit data queued for batch.');

    // Seed App Settings
    const settingsRef = adminDb.collection('settings').doc('app');
    batch.set(settingsRef, {
        appTitle: 'VisitData Hub',
        logoUrl: '',
        footerText: `Hak Cipta © ${new Date().getFullYear()} Dinas Pariwisata`,
        heroTitle: 'Pusat Data Pariwisata Modern Anda',
        heroSubtitle: 'Kelola, analisis, dan laporkan data kunjungan wisata dengan mudah dan efisien. Berdayakan pengambilan keputusan berbasis data untuk pariwisata daerah Anda.'
    }, { merge: true });
    console.log('App settings queued for batch.');


    console.log('Committing batch...');
    await batch.commit();
    console.log('Batch committed successfully.');

    return NextResponse.json({
      message: 'Database seeded successfully. It might take a moment for all data to be available.',
      users: usersWithUids.length,
      categories: seedCategories.length,
      destinations: seedDestinations.length,
      countries: seedCountries.length,
      visits: visitData.length,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
  }
}

    