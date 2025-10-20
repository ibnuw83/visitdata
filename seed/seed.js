'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

async function initializeFirebaseAdmin() {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.");
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

const usersToSeed = [
  {
    uid: 'eZIY6FKbXcglAWS9J6GgxnnLJ553',
    email: 'admin@dinas.com',
    password: 'password123',
    role: 'admin',
    data: {
      name: 'Admin Dinas',
      status: 'aktif',
      assignedLocations: [],
      avatarUrl: `https://avatar.vercel.sh/admin@dinas.com.png`
    }
  },
];

async function seedDatabase() {
    const { adminAuth, adminDb } = await initializeFirebaseAdmin();
    console.log('Starting database seeding...');
    
    // 1. Ensure Admin User, Claims, and Profile
    const adminUser = usersToSeed[0];
    console.log(`- Ensuring admin user: ${adminUser.email}`);

    try {
        // Create or update user in Firebase Auth
        await adminAuth.updateUser(adminUser.uid, {
            email: adminUser.email,
            password: adminUser.password,
            emailVerified: true,
        });
        console.log(`  - Updated existing auth user: ${adminUser.email}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            await adminAuth.createUser({
                uid: adminUser.uid,
                email: adminUser.email,
                password: adminUser.password,
                emailVerified: true,
            });
            console.log(`  - Created new auth user: ${adminUser.email}`);
        } else {
            console.error(`Error ensuring auth user ${adminUser.email}:`, error);
            throw error; // Re-throw other errors
        }
    }

    // Set custom claims to ensure role is set correctly at Auth level
    await adminAuth.setCustomUserClaims(adminUser.uid, { role: adminUser.role });
    console.log(`  - Set custom claim role: '${adminUser.role}' for ${adminUser.email}`);

    // Create or update user profile in Firestore
    const userRef = adminDb.collection('users').doc(adminUser.uid);
    await userRef.set({
      ...adminUser.data,
      uid: adminUser.uid,
      email: adminUser.email,
      role: adminUser.role,
    }, { merge: true });
    console.log(`  - Wrote/Updated Firestore profile for ${adminUser.email}`);

    console.log('Admin user seeding process complete.');
    return 'Admin user seeding process complete.';
}


// If run directly from CLI
if (require.main === module) {
  seedDatabase()
    .then((message) => {
      console.log(`CLI seeding script finished successfully: ${message}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('CLI seeding script failed:', error);
      process.exit(1);
    });
}

// For use in API routes
exports.seedDatabase = seedDatabase;
