
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let serviceAccount: any;

try {
  // Try to load the service account key from a local file.
  // This is for local development.
  // In a deployed environment (like Google Cloud), ADC will be used.
  serviceAccount = require("../../../serviceAccountKey.json");
} catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.log("serviceAccountKey.json not found, using Application Default Credentials. This is normal for production.");
    } else {
        console.error("Error loading service account key:", error);
    }
    serviceAccount = null;
}

if (getApps().length === 0) {
  initializeApp({
    // Use the service account if available, otherwise use Application Default Credentials
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
  });
}

export const adminDb = getFirestore();
