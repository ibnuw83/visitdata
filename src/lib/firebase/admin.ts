import admin from 'firebase-admin';

// Ambil kredensial dari environment variable yang di-string-kan
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

// Parse string JSON menjadi objek
const serviceAccount = JSON.parse(serviceAccountString);

// Inisialisasi Firebase Admin SDK hanya jika belum ada
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Hentikan proses jika inisialisasi gagal
    process.exit(1);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
