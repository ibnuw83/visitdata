import admin from 'firebase-admin';

// Ambil kredensial dari environment variable yang di-string-kan
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file.');
}

let serviceAccount;
try {
    // Parse string JSON menjadi objek
    serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.");
    throw e;
}


// Inisialisasi Firebase Admin SDK hanya jika belum ada
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Hentikan proses jika inisialisasi gagal
    process.exit(1);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
