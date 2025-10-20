
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

// Hanya inisialisasi Firebase Admin jika tidak dalam build produksi
// atau jika env vars tersedia. Ini mencegah error saat Vercel build.
if (process.env.NODE_ENV !== 'production' && process.env.FIREBASE_PROJECT_ID) {
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, "\n"),
      }),
    });
  } else {
    app = getApps()[0];
  }
  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
} else {
  // Sediakan instance dummy/null untuk lingkungan produksi/build
  // agar import tidak gagal, tetapi fungsionalitas tidak akan berjalan.
  adminDb = null as unknown as Firestore;
  adminAuth = null as unknown as Auth;
}


export { adminDb, adminAuth };
