
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// This setup uses environment variables for secure initialization,
// which is the recommended approach for Next.js and serverless environments.
// It avoids filesystem access during the build process.

if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    // In production (e.g., Vercel, Google Cloud), the SDK can often
    // auto-discover credentials without any config. For local dev,
    // ensure GOOGLE_APPLICATION_CREDENTIALS is set if these env vars are not.
    console.log("Initializing Firebase Admin with Application Default Credentials.");
    initializeApp();
  } else {
    console.log("Initializing Firebase Admin with environment variables.");
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // The private key needs to have its newlines properly escaped.
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }
}

export const adminDb = getFirestore();
