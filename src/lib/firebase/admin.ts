'use server';

import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

if (!getApps().some(app => app.name === 'admin')) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.log("Initializing Firebase Admin SDK...");
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, "\n"),
          }),
        }, 'admin');
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);
        console.log("Firebase Admin SDK initialized successfully.");
      } catch (e) {
        console.error("Firebase Admin SDK initialization failed:", e);
      }
  } else {
      console.warn("Firebase Admin environment variables are not set. Admin SDK not initialized.");
  }
} else {
    adminApp = getApps().find(app => app.name === 'admin')!;
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
}

export { adminDb, adminAuth };
