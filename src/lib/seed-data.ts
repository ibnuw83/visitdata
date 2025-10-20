
import { User, Destination, Category, Country, VisitData } from './types';
import { PlaceHolderImages } from './placeholder-images';
import type { Firestore, Auth } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';

// --- PENGGUNA ---
export const seedUsers: Omit<User, 'uid'>[] = [
  {
    name: 'Admin Dinas',
    email: 'admin@dinas.com',
    role: 'admin',
    assignedLocations: [],
    status: 'aktif',
    avatarUrl: PlaceHolderImages.find(p => p.id === 'user-1')?.imageUrl || '',
  },
  {
    name: 'Pengelola Jatijajar',
    email: 'pengelola@jatijajar.com',
    role: 'pengelola',
    assignedLocations: ['goa-jatijajar'], // Use predictable slugs
    status: 'aktif',
    avatarUrl: PlaceHolderImages.find(p => p.id === 'user-2')?.imageUrl || '',
  },
   {
    name: 'Pengelola Suwuk',
    email: 'pengelola@suwuk.com',
    role: 'pengelola',
    assignedLocations: ['pantai-suwuk'], // Use predictable slugs
    status: 'aktif',
    avatarUrl: PlaceHolderImages.find(p => p.id === 'user-3')?.imageUrl || '',
  },
];

// --- KATEGORI ---
export const seedCategories: Omit<Category, 'id'>[] = [
    { name: 'bahari' },
    { name: 'budaya' },
    { name: 'alam' },
    { name: 'buatan' },
    { name: 'sejarah' }
];

// --- DESTINASI ---
export const seedDestinations: Omit<Destination, 'id'>[] = [
  {
    name: 'Goa Jatijajar',
    category: 'alam',
    managementType: 'pemerintah',
    location: 'Jatijajar, Ayah, Kebumen',
    status: 'aktif',
    imageUrl: PlaceHolderImages.find(p => p.id === 'dest-jatijajar')?.imageUrl,
  },
  {
    name: 'Pantai Suwuk',
    category: 'bahari',
    managementType: 'pemerintah',
    location: 'Suwuk, Puring, Kebumen',
    status: 'aktif',
    imageUrl: PlaceHolderImages.find(p => p.id === 'dest-suwuk')?.imageUrl,
  },
  {
    name: 'Benteng Van Der Wijck',
    category: 'sejarah',
    managementType: 'swasta',
    location: 'Gombong, Kebumen',
    status: 'aktif',
    imageUrl: PlaceHolderImages.find(p => p.id === 'dest-vanderwijck')?.imageUrl,
  },
  {
    name: 'Pantai Menganti',
    category: 'bahari',
    managementType: 'pemerintah',
    location: 'Karangduwur, Ayah, Kebumen',
    status: 'aktif',
    imageUrl: PlaceHolderImages.find(p => p.id === 'dest-menganti')?.imageUrl,
  },
    {
    name: 'Bukit Pentulu Indah',
    category: 'alam',
    managementType: 'swasta',
    location: 'Karangsambung, Kebumen',
    status: 'aktif',
    imageUrl: PlaceHolderImages.find(p => p.id === 'dest-pentulu')?.imageUrl,
  },
];


// --- NEGARA ---
export const seedCountries: Country[] = [
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
    { code: "BI", name: "Burundi" }, { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodia" },
    { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "KY", name: "Cayman Islands" },
    { code: "CF", name: "Central African Republic" }, { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" },
    { code: "CN", name: "China" }, { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" },
    { code: "CG", name: "Congo" }, { code: "CD", name: "Congo, Democratic Republic of the" }, { code: "CK", name: "Cook Islands" },
    { code: "CR", name: "Costa Rica" }, { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" },
    { code: "CW", name: "Curaçao" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" },
    { code: "CI", name: "Côte d'Ivoire" }, { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" },
    { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" },
    { code: "EG", name: "Egypt" }, { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" },
    { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" },
    { code: "ET", name: "Ethiopia" }, { code: "FK", name: "Falkland Islands (Malvinas)" }, { code: "FO", name: "Faroe Islands" },
    { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
    { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" },
    { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" }, { code: "GR", name: "Greece" },
    { code: "GL", name: "Greenland" }, { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" },
    { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" },
    { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" }, { code: "HK", name: "Hong Kong" },
    { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" },
    { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
    { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" }, { code: "JO", name: "Jordan" },
    { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" },
    { code: "KP", name: "Korea, North" }, { code: "KR", name: "Korea, South" }, { code: "KW", name: "Kuwait" },
    { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" },
    { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" }, { code: "LR", name: "Liberia" },
    { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" }, { code: "MO", name: "Macao" }, { code: "MG", name: "Madagascar" },
    { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" },
    { code: "ML", name: "Mali" }, { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" },
    { code: "MQ", name: "Martinique" }, { code: "MR", name: "Mauritania" }, { code: "MU", name: "Mauritius" },
    { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" }, { code: "MD", name: "Moldova" },
    { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" }, { code: "ME", name: "Montenegro" },
    { code: "MS", name: "Montserrat" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" },
    { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" },
    { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" }, { code: "NC", name: "New Caledonia" },
    { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" },
    { code: "NG", name: "Nigeria" }, { code: "NU", name: "Niue" }, { code: "MK", name: "North Macedonia" },
    { code: "NO", name: "Norway" }, { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" },
    { code: "PW", name: "Palau" }, { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" },
    { code: "PY", name: "Paraguay" }, { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" },
    { code: "PL", "name": "Poland" }, { code: "PT", "name": "Portugal" }, { code: "PR", "name": "Puerto Rico" },
    { code: "QA", "name": "Qatar" }, { code: "RO", "name": "Romania" }, { code: "RU", "name": "Russia" },
    { code: "RW", "name": "Rwanda" }, { code: "SA", "name": "Saudi Arabia" }, { code: "SN", "name": "Senegal" },
    { code: "RS", "name": "Serbia" }, { code: "SC", "name": "Seychelles" }, { code: "SL", "name": "Sierra Leone" },
    { code: "SG", "name": "Singapore" }, { code: "SK", "name": "Slovakia" }, { code: "SI", "name": "Slovenia" },
    { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" },
    { code: "SS", name: "South Sudan" }, { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" },
    { code: "SD", name: "Sudan" }, { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" }, { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" },
    { code: "TJ", name: "Tajikistan" }, { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" },
    { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" },
    { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" },
    { code: "TM", name: "Turkmenistan" }, { code: "TV", name: "Tuvalu" }, { code: "UG", "name": "Uganda" },
    { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
    { code: "VU", name: "Vanuatu" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Viet Nam" },
    { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" }
];


// --- DATA KUNJUNGAN ---
function generateSeedVisitData(destinations: (Destination & { id: string })[]): VisitData[] {
  const visits: VisitData[] = [];
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

  destinations.forEach(dest => {
    months.forEach(({ month, name }) => {
      const wisnus = Math.floor(Math.random() * (dest.name.includes('Pantai') ? 3000 : 1500)) + 500;
      
      const wismanDetails = [
          { country: 'Malaysia', count: Math.floor(Math.random() * 30) + 5 },
          { country: 'Singapore', count: Math.floor(Math.random() * 25) + 5 },
          { country: 'Australia', count: Math.floor(Math.random() * 20) + 2 },
      ];
      const wisman = wismanDetails.reduce((sum, d) => sum + d.count, 0);

      visits.push({
        id: `${dest.id}-${year}-${month}`,
        destinationId: dest.id,
        year: year,
        month: month,
        monthName: name,
        wisnus: wisnus,
        wisman: wisman,
        wismanDetails: wismanDetails,
        totalVisitors: wisnus + wisman,
        locked: true,
        lastUpdatedBy: 'system-seed'
      });
    });
  });

  return visits;
}

export async function seedDatabase(adminDb: Firestore, adminAuth: AdminAuth) {
    if (!adminAuth || !adminDb) {
        throw new Error('Firebase Admin not initialized.');
    }

    const batch = adminDb.batch();

    console.log('Starting user authentication seeding...');
    
    const usersWithUids: User[] = [];

    for (const user of seedUsers) {
        let uid: string;
        try {
            const userRecord = await adminAuth.getUserByEmail(user.email);
            uid = userRecord.uid;
            await adminAuth.updateUser(uid, {
                password: "password123",
                displayName: user.name,
                photoURL: user.avatarUrl,
            });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await adminAuth.createUser({
                    email: user.email,
                    password: "password123",
                    displayName: user.name,
                    photoURL: user.avatarUrl,
                });
                uid = userRecord.uid;
            } else {
                throw error;
            }
        }
        
        await adminAuth.setCustomUserClaims(uid, { role: user.role });
        usersWithUids.push({ ...user, uid });
    }
    console.log('Finished auth user creation/retrieval and custom claims.');
    
    const seededDestinations: (Destination & { id: string })[] = [];
    for (const destination of seedDestinations) {
      const slug = destination.name.toLowerCase().replace(/\s+/g, '-');
      const docRef = adminDb.collection('destinations').doc(slug);
      const destWithId = { ...destination, id: docRef.id };
      batch.set(docRef, destWithId, { merge: true });
      seededDestinations.push(destWithId);
    }
    console.log('Destinations queued for batch (with merge).');

    console.log('Seeding Firestore user documents...');
    for (const user of usersWithUids) {
        const assignedLocationsIds = user.role === 'pengelola' 
            ? user.assignedLocations.map(slug => {
                const dest = seededDestinations.find(d => d.id === slug);
                return dest ? dest.id : null;
            }).filter((id): id is string => id !== null)
            : [];
        
        const userRef = adminDb.collection('users').doc(user.uid);
        batch.set(userRef, { ...user, assignedLocations: assignedLocationsIds }, { merge: true });
    }
    console.log('Finished queueing user documents (with merge).');

    for (const category of seedCategories) {
        const querySnapshot = await adminDb.collection('categories').where('name', '==', category.name).limit(1).get();
        if (querySnapshot.empty) {
            const docRef = adminDb.collection('categories').doc();
            batch.set(docRef, { ...category, id: docRef.id });
        }
    }
    console.log('Categories queued for batch (only if they dont exist).');

    seedCountries.forEach(country => {
        const docRef = adminDb.collection('countries').doc(country.code);
        batch.set(docRef, country, { merge: true });
    });
    console.log('Countries queued for batch (with merge).');

    console.log('Checking for existing visit data...');
    const visitsCollectionGroup = adminDb.collectionGroup('visits');
    const existingVisitsSnapshot = await visitsCollectionGroup.get();
    const existingVisitIds = new Set(existingVisitsSnapshot.docs.map(doc => doc.id));
    console.log(`Found ${existingVisitIds.size} existing visit documents.`);

    const newVisitData = generateSeedVisitData(seededDestinations);
    const visitsToCreate = newVisitData.filter(visit => !existingVisitIds.has(visit.id));
    
    console.log(`Generating ${newVisitData.length} potential visits, creating ${visitsToCreate.length} new ones.`);
    visitsToCreate.forEach(visit => {
        const docRef = adminDb.collection('destinations').doc(visit.destinationId).collection('visits').doc(visit.id);
        batch.set(docRef, visit);
    });
    console.log('New visit data queued for batch.');

    const settingsRef = adminDb.collection('settings').doc('app');
    batch.set(settingsRef, {
        appTitle: 'VisitData Hub',
        logoUrl: '',
        footerText: `Hak Cipta © ${new Date().getFullYear()} Dinas Pariwisata`,
        heroTitle: 'Pusat Data Pariwisata Modern Anda',
        heroSubtitle: 'Kelola, analisis, dan laporkan data kunjungan wisata dengan mudah dan efisien. Berdayakan pengambilan keputusan berbasis data untuk pariwisata daerah Anda.'
    }, { merge: true });
    console.log('App settings queued for batch (with merge).');

    console.log('Committing batch...');
    await batch.commit();
    console.log('Batch committed successfully.');

     return {
      users: usersWithUids.length,
      categories: seedCategories.length,
      destinations: seedDestinations.length,
      countries: seedCountries.length,
      newVisitsCreated: visitsToCreate.length,
    };
}
