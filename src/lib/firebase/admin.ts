
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let app: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

// Fungsi untuk menginisialisasi Firebase Admin
function initializeAdmin() {
  if (getApps().length === 0) {
    // Pastikan semua variabel lingkungan yang diperlukan ada
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.log("Initializing Firebase Admin SDK...");
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, "\n"),
        }),
      });
      adminDb = getFirestore(app);
      adminAuth = getAuth(app);
      console.log("Firebase Admin SDK initialized successfully.");
    } else {
      console.warn("Firebase Admin environment variables are not set. Admin SDK not initialized.");
    }
  } else {
    app = getApps()[0];
    if (app) {
        adminDb = getFirestore(app);
        adminAuth = getAuth(app);
    }
  }
}

// Panggil inisialisasi hanya sekali
if (typeof window === "undefined") { // Pastikan ini hanya berjalan di sisi server
    initializeAdmin();
}


export { adminDb, adminAuth };
