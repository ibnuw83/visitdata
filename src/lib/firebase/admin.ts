import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

let serviceAccount: any = null;

// Untuk penggunaan di lingkungan lokal atau server, letakkan file serviceAccountKey.json di direktori ini.
// Di lingkungan Google Cloud (seperti App Hosting), Application Default Credentials akan digunakan secara otomatis.
const keyPath = path.join(process.cwd(), "src/lib/firebase/serviceAccountKey.json");
if (fs.existsSync(keyPath)) {
  serviceAccount = require(keyPath);
}

if (getApps().length === 0) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
  });
}

export const adminDb = getFirestore();
