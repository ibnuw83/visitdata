
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

async function seedAuthUsers() {
  const auth = getAuth();
  const userRecords = [];
  for (const user of seedUsers) {
    try {
      const existingUser = await auth.getUserByEmail(user.email);
      console.log(`User ${user.email} already exists. Skipping creation.`);
      userRecords.push(existingUser);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        const userRecord = await auth.createUser({
          email: user.email,
          password: "password123",
          displayName: user.name,
        });
        console.log(`Successfully created new user: ${user.email}`);
        userRecords.push(userRecord);
      } else {
        throw error;
      }
    }
  }
  return userRecords;
}


export async function GET() {
  try {
    const batch = adminDb.batch();

    console.log('Starting user authentication seeding...');
    const userRecords = await seedAuthUsers();
    console.log('Finished user authentication seeding.');

    // Seed Users collection in Firestore
    userRecords.forEach((userRecord, index) => {
        const userRef = adminDb.collection('users').doc(userRecord.uid);
        const userData = seedUsers[index];
        batch.set(userRef, { ...userData, uid: userRecord.uid });
    });
    console.log('Users queued for Firestore batch.');

    // Seed Categories
    seedCategories.forEach(category => {
      const docRef = adminDb.collection('categories').doc();
      batch.set(docRef, { ...category, id: docRef.id });
    });
    console.log('Categories queued for batch.');

    // Seed Destinations
    const seededDestinations: (Destination & { id: string })[] = [];
    seedDestinations.forEach(destination => {
      const docRef = adminDb.collection('destinations').doc();
      const destWithId = { ...destination, id: docRef.id };
      batch.set(docRef, destWithId);
      seededDestinations.push(destWithId);
    });
    console.log('Destinations queued for batch.');

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
      message: 'Database seeded successfully.',
      users: userRecords.length,
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
