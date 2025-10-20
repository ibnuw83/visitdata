'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

async function initializeFirebaseAdmin() {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString || serviceAccountString.startsWith('GANTI_DENGAN')) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set or is still the default value. Please add it to your .env.local file.');
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string with no line breaks.");
    throw e;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return {
    adminAuth: admin.auth(),
    adminDb: admin.firestore(),
  };
}

const adminUserData = {
  uid: 'eZIY6FKbXcglAWS9J6GgxnnLJ553',
  email: 'admin@dinas.com',
  password: 'password123',
  role: 'admin',
  profileData: {
    name: 'Admin Dinas',
    status: 'aktif',
    assignedLocations: [],
    avatarUrl: `https://avatar.vercel.sh/admin@dinas.com.png`
  }
};

async function seedDatabase() {
    const { adminAuth, adminDb } = await initializeFirebaseAdmin();
    console.log('--- Starting Database Seeding (Simplified) ---');
    
    const { uid, email, password, role, profileData } = adminUserData;
    
    try {
        console.log(`1. Ensuring Auth user for ${email} with UID ${uid}...`);
        
        // Attempt to update user first. If it fails, create the user.
        // This is a robust way to handle initial setup and re-seeding.
        try {
            await adminAuth.updateUser(uid, {
                email: email,
                password: password,
                emailVerified: true,
            });
            console.log(`   - Auth user ${email} already existed. Updated successfully.`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`   - Auth user ${email} not found. Creating new user...`);
                await adminAuth.createUser({
                    uid: uid,
                    email: email,
                    password: password,
                    emailVerified: true,
                });
                console.log(`   - New auth user ${email} created successfully.`);
            } else {
                // Re-throw other errors
                throw error;
            }
        }

        console.log(`2. Setting custom claim '{ role: "${role}" }' for ${email}...`);
        await adminAuth.setCustomUserClaims(uid, { role: role });
        console.log(`   - Custom claim set successfully.`);

        console.log(`3. Writing Firestore profile for ${email}...`);
        const userRef = adminDb.collection('users').doc(uid);
        await userRef.set({
          ...profileData,
          uid: uid,
          email: email,
          role: role,
        }, { merge: true });
        console.log(`   - Firestore profile written successfully.`);
        
        console.log('--- Seeding process completed successfully! ---');
        return 'Admin user seeding process complete.';

    } catch (error) {
        console.error('--- Seeding process failed! ---');
        console.error('Error:', error.message);
        throw error;
    }
}


// If run directly from CLI
if (require.main === module) {
  seedDatabase()
    .then((message) => {
      console.log(`CLI seeding script finished successfully: ${message}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('CLI seeding script failed:', error.message);
      process.exit(1);
    });
}

// For use in API routes
exports.seedDatabase = seedDatabase;
