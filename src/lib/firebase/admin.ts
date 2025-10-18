
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
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
// As a fallback for local development convenience, you can place your
// `serviceAccountKey.json` file in the root directory. However, the recommended
// approach is using the env variable.

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export const adminDb = getFirestore();
