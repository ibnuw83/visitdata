
// This file is used to store the Firebase configuration.
// It is used by the Firebase SDK to connect to your Firebase project.
// You can get this from the Firebase console.

const hardcodedConfig = {
  apiKey: "AIzaSyDP9fsMt0L6-cfSebQuGKeNC5APbMwoTqQ",
  authDomain: "wisatavisits.firebaseapp.com",
  projectId: "wisatavisits",
  storageBucket: "wisatavisits.appspot.com",
  messagingSenderId: "594192326469",
  appId: "1:594192326469:web:5e3aee38f781d21ae4682c",
  measurementId: "G-JLXZF9PWYT"
};


export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || hardcodedConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || hardcodedConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || hardcodedConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || hardcodedConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || hardcodedConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || hardcodedConfig.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || hardcodedConfig.measurementId
};
