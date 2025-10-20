
'use server';

import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let app: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

function initializeAdmin() {
  if (getApps().find(a => a.name === 'admin')) {
      app = getApps().find(a => a.name === 'admin');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.log("Initializing Firebase Admin SDK...");
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, "\n"),
        }),
      }, 'admin');
  } else {
      console.warn("Firebase Admin environment variables are not set. Admin SDK not initialized.");
      return;
  }
  
  if (app) {
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
  }
}

// Panggil inisialisasi hanya sekali
if (typeof window === "undefined") { 
    initializeAdmin();
}

export { adminDb, adminAuth };
