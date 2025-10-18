
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// This setup is robust for both local development and production.
//
// In Production (e.g., deployed on Google Cloud/Firebase):
// `applicationDefault()` will automatically find the service account credentials
// from the environment. No `serviceAccountKey.json` file is needed.
//
// In Local Development:
// The Firebase Admin SDK, when using `applicationDefault()`, will automatically look for
// a file specified by the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.
// This is the recommended approach for local development.

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export const adminDb = getFirestore();
