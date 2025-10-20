
// This file is used to store the Firebase configuration.
// It is used by the Firebase SDK to connect to your Firebase project.
// You can get this from the Firebase console.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Function to check if the config is valid
export function isFirebaseConfigValid(config: typeof firebaseConfig): boolean {
    return Object.values(config).every(value => value && !value.startsWith('GANTI_DENGAN'));
}


// Check for missing configuration in development to guide the user.
if (process.env.NODE_ENV === 'development') {
  if (!isFirebaseConfigValid(firebaseConfig)) {
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([, value]) => !value || value.startsWith('GANTI_DENGAN'))
        .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
    
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!! FIREBASE CONFIG ERROR: Variabel lingkungan tidak lengkap !!!');
    console.error('!!! Harap salin nilai yang benar ke dalam file .env.local    !!!');
    if (missingKeys.length > 0) {
        console.error('----------------------------------------------------------------');
        console.error('Variabel yang hilang atau belum diisi:');
        missingKeys.forEach(key => console.error(`- ${key}`));
    }
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  }
}
