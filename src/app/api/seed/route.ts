
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import {
  seedUsers,
  seedCategories,
  seedDestinations,
  seedCountries,
  generateSeedVisitData,
} from '@/lib/seed-data';
import type { Destination } from '@/lib/types';

export async function GET() {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: 'Firebase Admin not initialized. Check server environment variables.' }, { status: 500 });
  }

  try {
    const batch = adminDb.batch();

    console.log('Starting user authentication seeding...');
    
    const usersWithUids: { uid: string; name: string; email: string; role: 'admin' | 'pengelola'; assignedLocations: string[]; status: 'aktif' | 'nonaktif'; avatarUrl: string; }[] = [];

    for (const user of seedUsers) {
        let uid: string;
        try {
            const userRecord = await adminAuth.getUserByEmail(user.email);
            uid = userRecord.uid;
            // SELALU perbarui pengguna yang ada untuk memastikan konsistensi
            await adminAuth.updateUser(uid, {
                password: "password123", // Atur ulang kata sandi
                displayName: user.name,
                photoURL: user.avatarUrl,
            });
            console.log(`User ${user.email} already exists. Updated and reset password. UID: ${uid}`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await adminAuth.createUser({
                    email: user.email,
                    password: "password123",
                    displayName: user.name,
                    photoURL: user.avatarUrl,
                });
                uid = userRecord.uid;
                console.log(`Successfully created new auth user: ${user.email} with UID: ${uid}.`);
            } else {
                throw error; // Lemparkan kembali error auth lainnya
            }
        }
        
        // Tetapkan custom claims untuk peran
        await adminAuth.setCustomUserClaims(uid, { role: user.role });
        console.log(`Set custom claim 'role:${user.role}' for ${user.email}`);

        usersWithUids.push({ ...user, uid });
    }
    console.log('Finished auth user creation/retrieval and custom claims.');

    // Seed Destinations terlebih dahulu untuk mendapatkan ID mereka
    const seededDestinations: (Destination & { id: string })[] = [];
    seedDestinations.forEach(destination => {
      const slug = destination.name.toLowerCase().replace(/\s+/g, '-');
      const docRef = adminDb.collection('destinations').doc(slug);
      const destWithId = { ...destination, id: docRef.id };
      batch.set(docRef, destWithId);
      seededDestinations.push(destWithId);
    });
    console.log('Destinations queued for batch.');

    console.log('Seeding Firestore user documents...');
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
    }
    console.log('Finished queueing user documents.');

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
