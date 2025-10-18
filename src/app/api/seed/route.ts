
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { User, Destination, VisitData, Category, Country } from '@/lib/types';

const userImage1 = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080";
const userImage2 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080";
const userImage3 = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080";
const userImage4 = "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjA3MzA4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080";

const seedUsers: Omit<User, 'password'>[] = [
  {
    uid: 'admin-01',
    name: 'Admin Dinas',
    email: 'admin@dinas.com',
    role: 'admin',
    assignedLocations: [],
    status: 'aktif',
    avatarUrl: userImage1
  },
  {
    uid: 'pengelola-01',
    name: 'Pengelola Jatijajar',
    email: 'pengelola@jatijajar.com',
    role: 'pengelola',
    assignedLocations: ['dest-01'],
    status: 'aktif',
    avatarUrl: userImage2
  },
  {
    uid: 'pengelola-02',
    name: 'Pengelola Suwuk',
    email: 'pengelola@suwuk.com',
    role: 'pengelola',
    assignedLocations: ['dest-02', 'dest-03'],
    status: 'aktif',
    avatarUrl: userImage3
  },
  {
    uid: 'pengelola-03',
    name: 'Pengelola Baru',
    email: 'pl@visitdata.com',
    role: 'pengelola',
    assignedLocations: ['dest-05'],
    status: 'aktif',
    avatarUrl: userImage4
  },
];

const destinations: Destination[] = [
  {
    id: 'dest-01',
    name: 'Goa Jatijajar',
    category: 'alam',
    managementType: 'pemerintah',
    location: 'Jatijajar, Ayah, Kebumen',
    status: 'aktif',
    imageUrl: "https://images.unsplash.com/photo-1649285661224-6b8119912ee6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjYXZlJTIwZW50cmFuY2V8ZW58MHx8fHwxNzYwNzY5ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 'dest-02',
    name: 'Pantai Suwuk',
    category: 'alam',
    managementType: 'pemerintah',
    location: 'Suwuk, Puring, Kebumen',
    status: 'aktif',
    imageUrl: "https://images.unsplash.com/photo-1599204723132-cb8790c9be1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxiZWFjaCUyMGxhbmRzY2FwZXxlbnwwfHx8fDE3NjA3NDY0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 'dest-03',
    name: 'Benteng Van der Wijck',
    category: 'sejarah',
    managementType: 'swasta',
    location: 'Gombong, Kebumen',
    status: 'aktif',
    imageUrl: "https://images.unsplash.com/photo-1717484140319-d4bb4705777a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxoaXN0b3JpYyUyMGZvcnR8ZW58MHx8fHwxNzYwNzY5ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
    {
    id: 'dest-04',
    name: 'Pantai Menganti',
    category: 'alam',
    managementType: 'swasta',
    location: 'Karangduwur, Ayah, Kebumen',
    status: 'nonaktif',
    imageUrl: "https://images.unsplash.com/photo-1671524732028-1b43ccb2b3a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Y2xpZmYlMjBiZWFjaHxlbnwwfHx8fDE3NjA3Njk4NjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
    id: 'dest-05',
    name: 'Bukit Pentulu Indah',
    category: 'buatan',
    managementType: 'swasta',
    location: 'Karangsambung, Kebumen',
    status: 'aktif',
    imageUrl: "https://images.unsplash.com/photo-1647577680781-6ed3f3cac7f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzY2VuaWMlMjBoaWxsfGVufDB8fHx8MTc2MDc2OTg2MHww&ixlib=rb-4.1.0&q=80&w=1080"
    }
];

const uniqueCategories = [...new Set(destinations.map(d => d.category))];
const categories: Category[] = uniqueCategories.map((cat) => ({
  id: cat,
  name: cat,
}));

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const currentYear = new Date().getFullYear();

const currentYearData: VisitData[] = destinations.flatMap(dest => 
    Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const wisnus = Math.floor(Math.random() * (5000 - 500) + 500);
        const wisman = Math.floor(Math.random() * (500 - 10) + 10);
        
        return {
            id: `${dest.id}-${currentYear}-${month}`,
            destinationId: dest.id,
            year: currentYear,
            month: month,
            monthName: monthNames[i],
            wisnus,
            wisman,
            wismanDetails: [
                { country: 'Malaysia', count: Math.floor(wisman * 0.4) },
                { country: 'Singapura', count: Math.floor(wisman * 0.3) },
                { country: 'Australia', count: Math.floor(wisman * 0.2) },
                { country: 'Jepang', count: Math.floor(wisman * 0.1) },
            ],
            totalVisitors: wisnus + wisman,
            locked: true,
        };
    })
);

const previousYear = currentYear - 1;
const previousYearData: VisitData[] = destinations.flatMap(dest => 
    Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const wisnus = Math.floor(Math.random() * (4500 - 400) + 400);
        const wisman = Math.floor(Math.random() * (450 - 5) + 5);

        return {
            id: `${dest.id}-${previousYear}-${month}`,
            destinationId: dest.id,
            year: previousYear,
            month: month,
            monthName: monthNames[i],
            wisnus,
            wisman,
            wismanDetails: [
                 { country: 'Malaysia', count: Math.floor(wisman * 0.5) },
                { country: 'Singapura', count: Math.floor(wisman * 0.3) },
                { country: 'Australia', count: Math.floor(wisman * 0.2) },
            ],
            totalVisitors: wisnus + wisman,
            locked: true,
        };
    })
);

const visitData: VisitData[] = [...currentYearData, ...previousYearData];

const countries: Country[] = [
    { "code": "AF", "name": "Afghanistan" }, { "code": "AL", "name": "Albania" },
    { "code": "DZ", "name": "Algeria" }, { "code": "AD", "name": "Andorra" },
    { "code": "AO", "name": "Angola" }, { "code": "AG", "name": "Antigua and Barbuda" },
    { "code": "AR", "name": "Argentina" }, { "code": "AM", "name": "Armenia" },
    { "code": "AU", "name": "Australia" }, { "code": "AT", "name": "Austria" },
    { "code": "AZ", "name": "Azerbaijan" }, { "code": "BS", "name": "Bahamas" },
    { "code": "BH", "name": "Bahrain" }, { "code": "BD", "name": "Bangladesh" },
    { "code": "BB", "name": "Barbados" }, { "code": "BY", "name": "Belarus" },
    { "code": "BE", "name": "Belgium" }, { "code": "BZ", "name": "Belize" },
    { "code": "BJ", "name": "Benin" }, { "code": "BT", "name": "Bhutan" },
    { "code": "BO", "name": "Bolivia" }, { "code": "BA", "name": "Bosnia and Herzegovina" },
    { "code": "BW", "name": "Botswana" }, { "code": "BR", "name": "Brazil" },
    { "code": "BN", "name": "Brunei" }, { "code": "BG", "name": "Bulgaria" },
    { "code": "BF", "name": "Burkina Faso" }, { "code": "BI", "name": "Burundi" },
    { "code": "CV", "name": "Cabo Verde" }, { "code": "KH", "name": "Cambodia" },
    { "code": "CM", "name": "Cameroon" }, { "code": "CA", "name": "Canada" },
    { "code": "CF", "name": "Central African Republic" }, { "code": "TD", "name": "Chad" },
    { "code": "CL", "name": "Chile" }, { "code": "CN", "name": "China" },
    { "code": "CO", "name": "Colombia" }, { "code": "KM", "name": "Comoros" },
    { "code": "CG", "name": "Congo" }, { "code": "CR", "name": "Costa Rica" },
    { "code": "HR", "name": "Croatia" }, { "code": "CU", "name": "Cuba" },
    { "code": "CY", "name": "Cyprus" }, { "code": "CZ", "name": "Czechia" },
    { "code": "DK", "name": "Denmark" }, { "code": "DJ", "name": "Djibouti" },
    { "code": "DM", "name": "Dominica" }, { "code": "DO", "name": "Dominican Republic" },
    { "code": "EC", "name": "Ecuador" }, { "code": "EG", "name": "Egypt" },
    { "code": "SV", "name": "El Salvador" }, { "code": "GQ", "name": "Equatorial Guinea" },
    { "code": "ER", "name": "Eritrea" }, { "code": "EE", "name": "Estonia" },
    { "code": "SZ", "name": "Eswatini" }, { "code": "ET", "name": "Ethiopia" },
    { "code": "FJ", "name": "Fiji" }, { "code": "FI", "name": "Finland" },
    { "code": "FR", "name": "France" }, { "code": "GA", "name": "Gabon" },
    { "code": "GM", "name": "Gambia" }, { "code": "GE", "name": "Georgia" },
    { "code": "DE", "name": "Germany" }, { "code": "GH", "name": "Ghana" },
    { "code": "GR", "name": "Greece" }, { "code": "GD", "name": "Grenada" },
    { "code": "GT", "name": "Guatemala" }, { "code": "GN", "name": "Guinea" },
    { "code": "GW", "name": "Guinea-Bissau" }, { "code": "GY", "name": "Guyana" },
    { "code": "HT", "name": "Haiti" }, { "code": "HN", "name": "Honduras" },
    { "code": "HU", "name": "Hungary" }, { "code": "IS", "name": "Iceland" },
    { "code": "IN", "name": "India" }, { "code": "ID", "name": "Indonesia" },
    { "code": "IR", "name": "Iran" }, { "code": "IQ", "name": "Iraq" },
    { "code": "IE", "name": "Ireland" }, { "code": "IL", "name": "Israel" },
    { "code": "IT", "name": "Italy" }, { "code": "JM", "name": "Jamaica" },
    { "code": "JP", "name": "Jepang" }, { "code": "JO", "name": "Jordan" },
    { "code": "KZ", "name": "Kazakhstan" }, { "code": "KE", "name": "Kenya" },
    { "code": "KI", "name": "Kiribati" }, { "code": "KW", "name": "Kuwait" },
    { "code": "KG", "name": "Kyrgyzstan" }, { "code": "LA", "name": "Laos" },
    { "code": "LV", "name": "Latvia" }, { "code": "LB", "name": "Lebanon" },
    { "code": "LS", "name": "Lesotho" }, { "code": "LR", "name": "Liberia" },
    { "code": "LY", "name": "Libya" }, { "code": "LI", "name": "Liechtenstein" },
    { "code": "LT", "name": "Lithuania" }, { "code": "LU", "name": "Luxembourg" },
    { "code": "MG", "name": "Madagascar" }, { "code": "MW", "name": "Malawi" },
    { "code": "MY", "name": "Malaysia" }, { "code": "MV", "name": "Maldives" },
    { "code": "ML", "name": "Mali" }, { "code": "MT", "name": "Malta" },
    { "code": "MH", "name": "Marshall Islands" }, { "code": "MR", "name": "Mauritania" },
    { "code": "MU", "name": "Mauritius" }, { "code": "MX", "name": "Mexico" },
    { "code": "FM", "name": "Micronesia" }, { "code": "MD", "name": "Moldova" },
    { "code": "MC", "name": "Monaco" }, { "code": "MN", "name": "Mongolia" },
    { "code": "ME", "name": "Montenegro" }, { "code": "MA", "name": "Morocco" },
    { "code": "MZ", "name": "Mozambique" }, { "code": "MM", "name": "Myanmar" },
    { "code": "NA", "name": "Namibia" }, { "code": "NR", "name": "Nauru" },
    { "code": "NP", "name": "Nepal" }, { "code": "NL", "name": "Netherlands" },
    { "code": "NZ", "name": "New Zealand" }, { "code": "NI", "name": "Nicaragua" },
    { "code": "NE", "name": "Niger" }, { "code": "NG", "name": "Nigeria" },
    { "code": "KP", "name": "North Korea" }, { "code": "MK", "name": "North Macedonia" },
    { "code": "NO", "name": "Norway" }, { "code": "OM", "name": "Oman" },
    { "code": "PK", "name": "Pakistan" }, { "code": "PW", "name": "Palau" },
    { "code": "PA", "name": "Panama" }, { "code": "PG", "name": "Papua New Guinea" },
    { "code": "PY", "name": "Paraguay" }, { "code": "PE", "name": "Peru" },
    { "code": "PH", "name": "Philippines" }, { "code": "PL", "name": "Poland" },
    { "code": "PT", "name": "Portugal" }, { "code": "QA", "name": "Qatar" },
    { "code": "RO", "name": "Romania" }, { "code": "RU", "name": "Russia" },
    { "code": "RW", "name": "Rwanda" }, { "code": "KN", "name": "Saint Kitts and Nevis" },
    { "code": "LC", "name": "Saint Lucia" }, { "code": "VC", "name": "Saint Vincent and the Grenadines" },
    { "code": "WS", "name": "Samoa" }, { "code": "SM", "name": "San Marino" },
    { "code": "ST", "name": "Sao Tome and Principe" }, { "code": "SA", "name": "Saudi Arabia" },
    { "code": "SN", "name": "Senegal" }, { "code": "RS", "name": "Serbia" },
    { "code": "SC", "name": "Seychelles" }, { "code": "SL", "name": "Sierra Leone" },
    { "code": "SG", "name": "Singapura" }, { "code": "SK", "name": "Slovakia" },
    { "code": "SI", "name": "Slovenia" }, { "code": "SB", "name": "Solomon Islands" },
    { "code": "SO", "name": "Somalia" }, { "code": "ZA", "name": "South Africa" },
    { "code": "KR", "name": "South Korea" }, { "code": "SS", "name": "South Sudan" },
    { "code": "ES", "name": "Spain" }, { "code": "LK", "name": "Sri Lanka" },
    { "code": "SD", "name": "Sudan" }, { "code": "SR", "name": "Suriname" },
    { "code": "SE", "name": "Sweden" }, { "code": "CH", "name": "Switzerland" },
    { "code": "SY", "name": "Syria" }, { "code": "TW", "name": "Taiwan" },
    { "code": "TJ", "name": "Tajikistan" }, { "code": "TZ", "name": "Tanzania" },
    { "code": "TH", "name": "Thailand" }, { "code": "TL", "name": "Timor-Leste" },
    { "code": "TG", "name": "Togo" }, { "code": "TO", "name": "Tonga" },
    { "code": "TT", "name": "Trinidad and Tobago" }, { "code": "TN", "name": "Tunisia" },
    { "code": "TR", "name": "Turkey" }, { "code": "TM", "name": "Turkmenistan" },
    { "code": "TV", "name": "Tuvalu" }, { "code": "UG", "name": "Uganda" },
    { "code": "UA", "name": "Ukraine" }, { "code": "AE", "name": "United Arab Emirates" },
    { "code": "GB", "name": "United Kingdom" }, { "code": "US", "name": "United States" },
    { "code": "UY", "name": "Uruguay" }, { "code": "UZ", "name": "Uzbekistan" },
    { "code": "VU", "name": "Vanuatu" }, { "code": "VE", "name": "Venezuela" },
    { "code": "VN", "name": "Vietnam" }, { "code": "YE", "name": "Yemen" },
    { "code": "ZM", "name": "Zambia" }, { "code": "ZW", "name": "Zimbabwe" }
];

export async function POST() {
  try {
    const adminRef = adminDb.doc("users/admin-01");
    const adminDoc = await adminRef.get();

    if (adminDoc.exists) {
      return NextResponse.json({ message: "Data sudah ada, seeding dilewati." });
    }

    console.log("Memulai proses seeding data awal via API route...");
    const batch = adminDb.batch();

    // Seed users
    seedUsers.forEach((userDoc) => {
      batch.set(adminDb.doc(`users/${userDoc.uid}`), userDoc);
    });

    // Seed destinasi
    destinations.forEach((d) => batch.set(adminDb.doc(`destinations/${d.id}`), d));

    // Seed kategori
    categories.forEach((c) => batch.set(adminDb.doc(`categories/${c.id}`), c));

    // Seed negara
    countries.forEach((c) => batch.set(adminDb.doc(`countries/${c.code}`), c));

    // Seed data kunjungan
    visitData.forEach((vd) =>
      batch.set(adminDb.doc(`destinations/${vd.destinationId}/visits/${vd.id}`), vd)
    );

    await batch.commit();

    console.log("Seeding selesai tanpa error.");
    return NextResponse.json({ message: "Data awal berhasil dimuat." });
  } catch (error: any) {
    console.error("Gagal seeding:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan seeding data awal" },
      { status: 500 }
    );
  }
}
