// This file is converted to CommonJS to be run by Node.js directly.
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const admin = require('firebase-admin');

async function initializeFirebaseAdmin() {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }
  const serviceAccount = JSON.parse(serviceAccountString);

  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error.message);
      process.exit(1);
    }
  }
  return {
    adminAuth: admin.auth(),
    adminDb: admin.firestore(),
  };
}

const placeholderImages = [
    {
      "id": "user-1",
      "description": "Admin User Avatar",
      "imageUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "person portrait"
    },
    {
      "id": "user-2",
      "description": "Manager User Avatar 1",
      "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "person portrait"
    },
    {
      "id": "user-3",
      "description": "Manager User Avatar 2",
      "imageUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "person portrait"
    },
    {
      "id": "user-4",
      "description": "New Manager User Avatar",
      "imageUrl": "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "person portrait"
    },
    {
      "id": "dest-jatijajar",
      "description": "Goa Jatijajar Cave",
      "imageUrl": "https://images.unsplash.com/photo-1649285661224-6b8119912ee6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjYXZlJTIwZW50cmFuY2V8ZW58MHx8fHwxNzYwNzY5ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "cave entrance"
    },
    {
      "id": "dest-suwuk",
      "description": "Pantai Suwuk Beach",
      "imageUrl": "https://images.unsplash.com/photo-1599204723132-cb8790c9be1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxiZWFjaCUyMGxhbmRzY2FwZXxlbnwwfHx8fDE3NjA3NDY0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "beach landscape"
    },
    {
      "id": "dest-vanderwijck",
      "description": "Benteng Van der Wijck Fort",
      "imageUrl": "https://images.unsplash.com/photo-1717484140319-d4bb4705777a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxoaXN0b3JpYyUyMGZvcnR8ZW58MHx8fHwxNzYwNzY5ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "historic fort"
    },
    {
      "id": "dest-menganti",
      "description": "Pantai Menganti Beach",
      "imageUrl": "https://images.unsplash.com/photo-1671524732028-1b43ccb2b3a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Y2xpZmYlMjBiZWFjaHxlbnwwfHx8fDE3NjA3Njk4NjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "cliff beach"
    },
    {
      "id": "dest-pentulu",
      "description": "Bukit Pentulu Indah Hill",
      "imageUrl": "https://images.unsplash.com/photo-1647577680781-6ed3f3cac7f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzY2VuaWMlMjBoaWxsfGVufDB8fHx8MTc2MDc2OTg2MHww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "scenic hill"
    }
  ];
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
      avatarUrl: placeholderImages.find(p => p.id === 'user-1')?.imageUrl
    }
  },
  {
    uid: 'manager1',
    email: 'pengelola.jatijajar@dinas.com',
    password: 'password123',
    role: 'pengelola',
    data: {
      name: 'Pengelola Jatijajar',
      status: 'aktif',
      assignedLocations: ['jatijajar'],
      avatarUrl: placeholderImages.find(p => p.id === 'user-2')?.imageUrl
    }
  },
  {
    uid: 'manager2',
    email: 'pengelola.suwuk@dinas.com',
    password: 'password123',
    role: 'pengelola',
    data: {
      name: 'Pengelola Suwuk',
      status: 'aktif',
      assignedLocations: ['suwuk', 'menganti'],
       avatarUrl: placeholderImages.find(p => p.id === 'user-3')?.imageUrl
    }
  },
];
const categoriesToSeed = [
    { id: 'bahari', name: 'bahari' },
    { id: 'budaya', name: 'budaya' },
    { id: 'alam', name: 'alam' },
    { id: 'buatan', name: 'buatan' },
];
const destinationsToSeed = [
    { id: 'jatijajar', data: { name: 'Goa Jatijajar', category: 'alam', managementType: 'pemerintah', location: 'Desa Jatijajar, Ayah', status: 'aktif', imageUrl: placeholderImages.find(p => p.id === 'dest-jatijajar')?.imageUrl } },
    { id: 'suwuk', data: { name: 'Pantai Suwuk', category: 'bahari', managementType: 'pemerintah', location: 'Desa Suwuk, Puring', status: 'aktif', imageUrl: placeholderImages.find(p => p.id === 'dest-suwuk')?.imageUrl } },
    { id: 'vanderwijck', data: { name: 'Benteng Van der Wijck', category: 'budaya', managementType: 'swasta', location: 'Gombong', status: 'nonaktif', imageUrl: placeholderImages.find(p => p.id === 'dest-vanderwijck')?.imageUrl } },
    { id: 'menganti', data: { name: 'Pantai Menganti', category: 'bahari', managementType: 'swasta', location: 'Desa Karangduwur, Ayah', status: 'aktif', imageUrl: placeholderImages.find(p => p.id === 'dest-menganti')?.imageUrl } },
    { id: 'pentulu', data: { name: 'Bukit Pentulu Indah', category: 'alam', managementType: 'swasta', location: 'Karangsambung', status: 'aktif', imageUrl: placeholderImages.find(p => p.id === 'dest-pentulu')?.imageUrl } },
];
const countriesToSeed = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" }, { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" }, { code: "AQ", name: "Antarctica" }, { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" }, { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" }, { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" }, { code: "BJ", name: "Benin" }, { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" }, { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" }, { code: "IO", name: "British Indian Ocean Territory" },
  { code: "BN", name: "Brunei Darussalam" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "KH", name: "Cambodia" }, { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" }, { code: "CV", name: "Cape Verde" }, { code: "KY", name: "Cayman Islands" },
  { code: "CF", name: "Central African Republic" }, { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" },
  { code: "CN", name: "China" }, { code: "CX", name: "Christmas Island" }, { code: "CC", name: "Cocos (Keeling) Islands" },
  { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo, The Democratic Republic of the" }, { code: "CK", name: "Cook Islands" },
  { code: "CR", name: "Costa Rica" }, { code: "CI", name: "Cote D'Ivoire" }, { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" }, { code: "ET", name: "Ethiopia" }, { code: "FK", name: "Falkland Islands (Malvinas)" },
  { code: "FO", name: "Faroe Islands" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "GF", name: "French Guiana" }, { code: "PF", name: "French Polynesia" },
  { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" }, { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" }, { code: "GL", name: "Greenland" }, { code: "GD", name: "Grenada" },
  { code: "GP", name: "Guadeloupe" }, { code: "GU", name: "Guam" }, { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" }, { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran, Islamic Republic Of" }, { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" }, { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea, Democratic People's Republic of" }, { code: "KR", name: "Korea, Republic of" },
  { code: "KW", name: "Kuwait" }, { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Lao People's Democratic Republic" },
  { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" }, { code: "LY", name: "Libyan Arab Jamahiriya" }, { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" }, { code: "MO", name: "Macao" },
  { code: "MK", name: "Macedonia" }, { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" }, { code: "MU", name: "Mauritius" }, { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia, Federated States of" },
  { code: "MD", name: "Moldova, Republic of" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" },
  { code: "MS", name: "Montserrat" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" }, { code: "AN", name: "Netherlands Antilles" },
  { code: "NC", name: "New Caledonia" }, { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" }, { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Island" }, { code: "MP", name: "Northern Mariana Islands" }, { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestinian Territory, Occupied" }, { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" }, { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" }, { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" }, { code: "RE", name: "Reunion" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russian Federation" }, { code: "RW", name: "Rwanda" }, { code: "SH", name: "Saint Helena" },
  { code: "KN", name: "Saint Kitts and Nevis" }, { code: "LC", name: "Saint Lucia" }, { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines" }, { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" }, { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" }, { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" }, { code: "SZ", name: "Swaziland" }, { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" }, { code: "SY", "name": "Syrian Arab Republic" },
  { code: "TW", name: "Taiwan, Province of China" }, { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania, United Republic of" }, { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" }, { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Viet Nam" },
  { code: "VG", name: "Virgin Islands, British" }, { code: "VI", name: "Virgin Islands, U.S." },
  { code: "WF", name: "Wallis and Futuna" }, { code: "EH", name: "Western Sahara" }, { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" }
];


async function ensureAuthUserAndClaims(adminAuth, { uid, email, password, role }) {
  try {
    console.log(`- Ensuring user: ${email} (UID: ${uid})`);
    
    // Create or update user in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.updateUser(uid, {
        email: email,
        password: password,
        emailVerified: true,
      });
      console.log(`  - Updated existing auth user: ${email}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await adminAuth.createUser({
          uid: uid,
          email: email,
          password: password,
          emailVerified: true,
        });
        console.log(`  - Created new auth user: ${email}`);
      } else {
        throw error; // Re-throw other errors
      }
    }
    
    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: role });
    console.log(`  - Set custom claim role: '${role}' for ${email}`);
    
    return userRecord;
  } catch (error) {
    console.error(`Error ensuring auth user ${email}:`, error);
    throw error;
  }
}

async function seedDatabase() {
  const { adminAuth, adminDb } = await initializeFirebaseAdmin();
  const batch = adminDb.batch();

  console.log('Starting database seeding...');

  // 1. Seed Users (Auth and Firestore)
  for (const user of usersToSeed) {
    await ensureAuthUserAndClaims(adminAuth, user);
    const userRef = adminDb.collection('users').doc(user.uid);
    batch.set(userRef, {
      ...user.data,
      uid: user.uid,
      email: user.email,
      role: user.role,
    });
  }
  console.log('-> Users queued for batch.');

  // 2. Seed Categories
  categoriesToSeed.forEach(category => {
    const docRef = adminDb.collection('categories').doc(category.id);
    batch.set(docRef, category);
  });
  console.log('-> Categories queued for batch.');
  
  // 3. Seed Destinations
  destinationsToSeed.forEach(dest => {
    const docRef = adminDb.collection('destinations').doc(dest.id);
    batch.set(docRef, { ...dest.data, id: dest.id });
  });
  console.log('-> Destinations queued for batch.');

  // 4. Seed Countries
  countriesToSeed.forEach(country => {
      const docRef = adminDb.collection('countries').doc(country.code);
      batch.set(docRef, country);
  });
  console.log('-> Countries queued for batch.');

  // 5. Seed Visit Data (for current and previous year)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1];
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(0, i).toLocaleString('id-ID', { month: 'long' })
  }));

  destinationsToSeed.forEach(dest => {
    if (dest.data.status === 'aktif') {
      years.forEach(year => {
        months.forEach(m => {
          const visitId = `${dest.id}-${year}-${m.month}`;
          const docRef = adminDb.collection('destinations').doc(dest.id).collection('visits').doc(visitId);
          const isFuture = year > currentYear || (year === currentYear && m.month > new Date().getMonth() + 1);
          batch.set(docRef, {
            id: visitId,
            destinationId: dest.id,
            year: year,
            month: m.month,
            monthName: m.monthName,
            wisnus: 0,
            wisman: 0,
            wismanDetails: [],
            totalVisitors: 0,
            locked: isFuture,
          });
        });
      });
    }
  });
  console.log('-> Visit data queued for batch.');
  
  // Commit the batch
  await batch.commit();
  console.log('Seeding complete. Batch committed to Firestore.');
}

// If run directly from CLI
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('CLI seeding script finished successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('CLI seeding script failed:', error);
      process.exit(1);
    });
}

// For use in API routes
exports.seedDatabase = seedDatabase;
