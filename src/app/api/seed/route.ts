
'use server';

import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import {
  seedUsers,
  seedCategories,
  seedDestinations,
  seedCountries,
  generateSeedVisitData,
} from '@/lib/seed-data';
import type { Destination, User, VisitData } from '@/lib/types';

export async function GET() {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: 'Firebase Admin not initialized. Check server environment variables.' }, { status: 500 });
  }

  try {
    const batch = adminDb.batch();

    console.log('Starting user authentication seeding...');
    
    const usersWithUids: User[] = [];

    for (const user of seedUsers) {
        let uid: string;
        try {
            const userRecord = await adminAuth.getUserByEmail(user.email);
            uid = userRecord.uid;
            await adminAuth.updateUser(uid, {
                password: "password123",
                displayName: user.name,
                photoURL: user.avatarUrl,
            });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await adminAuth.createUser({
                    email: user.email,
                    password: "password123",
                    displayName: user.name,
                    photoURL: user.avatarUrl,
                });
                uid = userRecord.uid;
            } else {
                throw error;
            }
        }
        
        await adminAuth.setCustomUserClaims(uid, { role: user.role });
        usersWithUids.push({ ...user, uid });
    }
    console.log('Finished auth user creation/retrieval and custom claims.');
    
    // --- Destinations ---
    const seededDestinations: (Destination & { id: string })[] = [];
    for (const destination of seedDestinations) {
      const slug = destination.name.toLowerCase().replace(/\s+/g, '-');
      const docRef = adminDb.collection('destinations').doc(slug);
      const destWithId = { ...destination, id: docRef.id };
      batch.set(docRef, destWithId, { merge: true });
      seededDestinations.push(destWithId);
    }
    console.log('Destinations queued for batch (with merge).');

    // --- Users ---
    console.log('Seeding Firestore user documents...');
    for (const user of usersWithUids) {
        const assignedLocationsIds = user.role === 'pengelola' 
            ? user.assignedLocations.map(slug => {
                const dest = seededDestinations.find(d => d.id === slug);
                return dest ? dest.id : null;
            }).filter((id): id is string => id !== null)
            : [];
        
        const userRef = adminDb.collection('users').doc(user.uid);
        batch.set(userRef, { ...user, assignedLocations: assignedLocationsIds }, { merge: true });
    }
    console.log('Finished queueing user documents (with merge).');

    // --- Categories ---
    for (const category of seedCategories) {
        const querySnapshot = await adminDb.collection('categories').where('name', '==', category.name).limit(1).get();
        if (querySnapshot.empty) {
            const docRef = adminDb.collection('categories').doc();
            batch.set(docRef, { ...category, id: docRef.id });
        }
    }
    console.log('Categories queued for batch (only if they dont exist).');

    // --- Countries ---
    seedCountries.forEach(country => {
        const docRef = adminDb.collection('countries').doc(country.code);
        batch.set(docRef, country, { merge: true });
    });
    console.log('Countries queued for batch (with merge).');

    // --- Visit Data (Idempotent) ---
    console.log('Checking for existing visit data...');
    const visitsCollectionGroup = adminDb.collectionGroup('visits');
    const existingVisitsSnapshot = await visitsCollectionGroup.get();
    const existingVisitIds = new Set(existingVisitsSnapshot.docs.map(doc => doc.id));
    console.log(`Found ${existingVisitIds.size} existing visit documents.`);

    const newVisitData = generateSeedVisitData(seededDestinations);
    const visitsToCreate = newVisitData.filter(visit => !existingVisitIds.has(visit.id));
    
    console.log(`Generating ${newVisitData.length} potential visits, creating ${visitsToCreate.length} new ones.`);
    visitsToCreate.forEach(visit => {
        const docRef = adminDb.collection('destinations').doc(visit.destinationId).collection('visits').doc(visit.id);
        batch.set(docRef, visit);
    });
    console.log('New visit data queued for batch.');

    // --- App Settings ---
    const settingsRef = adminDb.collection('settings').doc('app');
    batch.set(settingsRef, {
        appTitle: 'VisitData Hub',
        logoUrl: '',
        footerText: `Hak Cipta © ${new Date().getFullYear()} Dinas Pariwisata`,
        heroTitle: 'Pusat Data Pariwisata Modern Anda',
        heroSubtitle: 'Kelola, analisis, dan laporkan data kunjungan wisata dengan mudah dan efisien. Berdayakan pengambilan keputusan berbasis data untuk pariwisata daerah Anda.'
    }, { merge: true });
    console.log('App settings queued for batch (with merge).');

    console.log('Committing batch...');
    await batch.commit();
    console.log('Batch committed successfully.');

    return NextResponse.json({
      message: 'Database seeding completed idempotently.',
      users: usersWithUids.length,
      categories: seedCategories.length,
      destinations: seedDestinations.length,
      countries: seedCountries.length,
      newVisitsCreated: visitsToCreate.length,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
  }
}
