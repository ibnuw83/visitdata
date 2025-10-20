
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

async function initializeFirebaseAdmin() {
  // Hanya jalankan jika di lingkungan non-produksi
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Proses seeding tidak boleh dijalankan di lingkungan produksi.');
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString || serviceAccountString.startsWith('GANTI_DENGAN')) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set or is still the default value. Please add it to your .env.local file.');
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string with no line breaks.");
    throw e;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return {
    adminAuth: admin.auth(),
    adminDb: admin.firestore(),
  };
}

const adminUserData = {
  uid: 'eZIY6FKbXcglAWS9J6GgxnnLJ553',
  email: 'admin@dinas.com',
  password: 'password123',
  profileData: {
    name: 'Admin Dinas',
    status: 'aktif',
    role: 'admin',
    assignedLocations: [],
    avatarUrl: `https://avatar.vercel.sh/admin@dinas.com.png`
  }
};

async function seedDatabase() {
    const { adminAuth, adminDb } = await initializeFirebaseAdmin();
    console.log('--- Memulai Proses Seeding Admin ---');
    
    const { uid, email, password, profileData } = adminUserData;
    
    try {
        console.log(`1. Memastikan pengguna Auth untuk ${email} dengan UID ${uid}...`);
        
        try {
            await adminAuth.updateUser(uid, {
                email: email,
                password: password,
                emailVerified: true,
            });
            console.log(`   - Pengguna Auth ${email} sudah ada. Berhasil diperbarui.`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`   - Pengguna Auth ${email} tidak ditemukan. Membuat pengguna baru...`);
                await adminAuth.createUser({
                    uid: uid,
                    email: email,
                    password: password,
                    emailVerified: true,
                });
                console.log(`   - Pengguna Auth baru ${email} berhasil dibuat.`);
            } else {
                throw error;
            }
        }

        console.log(`2. Menetapkan Custom Claim 'admin' untuk pengguna ${email}...`);
        await adminAuth.setCustomUserClaims(uid, { role: 'admin' });
        console.log(`   - Custom Claim { role: 'admin' } berhasil ditetapkan.`);

        console.log(`3. Menulis profil Firestore untuk ${email}...`);
        const userRef = adminDb.collection('users').doc(uid);
        await userRef.set({
          ...profileData,
          uid: uid,
          email: email,
        }, { merge: true });
        console.log(`   - Profil Firestore berhasil ditulis.`);
        

        console.log('--- Proses Seeding Berhasil! ---');
        return 'Proses seeding pengguna admin selesai.';

    } catch (error) {
        console.error('--- Proses Seeding Gagal! ---');
        console.error('Error:', error.message);
        throw error;
    }
}


if (require.main === module) {
  seedDatabase()
    .then((message) => {
      console.log(`Skrip seeding CLI selesai: ${message}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Skrip seeding CLI gagal:', error.message);
      process.exit(1);
    });
}

exports.seedDatabase = seedDatabase;
