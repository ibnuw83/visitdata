
import { User, Destination, VisitData, UnlockRequest, Category, Country } from './types';
import { PlaceHolderImages } from './placeholder-images';

const userImage1 = PlaceHolderImages.find(p => p.id === 'user-1')?.imageUrl || '';
const userImage2 = PlaceHolderImages.find(p => p.id === 'user-2')?.imageUrl || '';
const userImage3 = PlaceHolderImages.find(p => p.id === 'user-3')?.imageUrl || '';
const userImage4 = PlaceHolderImages.find(p => p.id === 'user-4')?.imageUrl || '';

export const users: User[] = [
  {
    uid: 'admin-01',
    name: 'Admin Dinas',
    email: 'admin@dinas.com',
    password: 'password123',
    role: 'admin',
    assignedLocations: [],
    status: 'aktif',
    avatarUrl: userImage1
  },
  {
    uid: 'pengelola-01',
    name: 'Pengelola Jatijajar',
    email: 'pengelola@jatijajar.com',
    password: 'password123',
    role: 'pengelola',
    assignedLocations: ['dest-01'],
    status: 'aktif',
    avatarUrl: userImage2
  },
  {
    uid: 'pengelola-02',
    name: 'Pengelola Suwuk',
    email: 'pengelola@suwuk.com',
    password: 'password123',
    role: 'pengelola',
    assignedLocations: ['dest-02', 'dest-03'],
    status: 'aktif',
    avatarUrl: userImage3
  },
  {
    uid: 'pengelola-03',
    name: 'Pengelola Baru',
    email: 'pl@visitdata.com',
    password: 'user123',
    role: 'pengelola',
    assignedLocations: ['dest-05'],
    status: 'aktif',
    avatarUrl: userImage4
  },
];

export const destinations: Destination[] = [
  {
    id: 'dest-01',
    name: 'Goa Jatijajar',
    category: 'alam',
    managementType: 'pemerintah',
    manager: 'pengelola-01',
    location: 'Jatijajar, Ayah, Kebumen',
    status: 'aktif',
  },
  {
    id: 'dest-02',
    name: 'Pantai Suwuk',
    category: 'alam',
    managementType: 'pemerintah',
    manager: 'pengelola-02',
    location: 'Suwuk, Puring, Kebumen',
    status: 'aktif',
  },
  {
    id: 'dest-03',
    name: 'Benteng Van der Wijck',
    category: 'sejarah',
    managementType: 'swasta',
    manager: 'pengelola-02',
    location: 'Gombong, Kebumen',
    status: 'aktif',
  },
    {
    id: 'dest-04',
    name: 'Pantai Menganti',
    category: 'alam',
    managementType: 'swasta',
    manager: 'pengelola-01',
    location: 'Karangduwur, Ayah, Kebumen',
    status: 'nonaktif',
    },
    {
    id: 'dest-05',
    name: 'Bukit Pentulu Indah',
    category: 'buatan',
    managementType: 'swasta',
    manager: 'pengelola-03',
    location: 'Karangsambung, Kebumen',
    status: 'aktif',
    }
];

const uniqueCategories = [...new Set(destinations.map(d => d.category))];
export const categories: Category[] = uniqueCategories.map((cat, index) => ({
  id: `cat-${index + 1}`,
  name: cat,
}));


const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const currentYear = new Date().getFullYear();

// Create data for the current year
const currentYearData: VisitData[] = destinations.flatMap(dest => 
    Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const wisnus = Math.floor(Math.random() * (5000 - 500) + 500);
        const wisman = Math.floor(Math.random() * (500 - 10) + 10);
        
        return {
            id: `visit-${dest.id}-${currentYear}-${month}`,
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
            eventVisitors: 0,
            historicalVisitors: 0,
            totalVisitors: wisnus + wisman,
            locked: true, // Lock all by default
            lastUpdatedBy: dest.manager,
        };
    })
);

// Create data for the previous year
const previousYear = currentYear - 1;
const previousYearData: VisitData[] = destinations.flatMap(dest => 
    Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const wisnus = Math.floor(Math.random() * (4500 - 400) + 400);
        const wisman = Math.floor(Math.random() * (450 - 5) + 5);

        return {
            id: `visit-${dest.id}-${previousYear}-${month}`,
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
            eventVisitors: 0,
            historicalVisitors: 0,
            totalVisitors: wisnus + wisman,
            locked: true,
            lastUpdatedBy: dest.manager,
        };
    })
);

export const visitData: VisitData[] = [...currentYearData, ...previousYearData];


export const unlockRequests: UnlockRequest[] = [
    {
        id: 'req-01',
        destinationId: 'dest-01',
        month: 5,
        year: previousYear,
        reason: 'Ada kesalahan input data wisman, perlu direvisi.',
        status: 'pending',
        requestedBy: 'pengelola-01',
        timestamp: new Date(previousYear, 5, 28).toISOString(),
    },
    {
        id: 'req-02',
        destinationId: 'dest-02',
        month: 4,
        year: previousYear,
        reason: 'Data pengunjung event belum dimasukkan.',
        status: 'approved',
        requestedBy: 'pengelola-02',
        processedBy: 'admin-01',
        timestamp: new Date(previousYear, 5, 20).toISOString(),
    },
        {
        id: 'req-03',
        destinationId: 'dest-03',
        month: 3,
        year: previousYear,
        reason: 'Revisi jumlah wisnus, data awal tidak akurat.',
        status: 'rejected',
        requestedBy: 'pengelola-02',
        processedBy: 'admin-01',
        timestamp: new Date(previousYear, 5, 15).toISOString(),
    }
];

export const countries: Country[] = [
    { "code": "AF", "name": "Afghanistan" },
    { "code": "AL", "name": "Albania" },
    { "code": "DZ", "name": "Algeria" },
    { "code": "AD", "name": "Andorra" },
    { "code": "AO", "name": "Angola" },
    { "code": "AG", "name": "Antigua and Barbuda" },
    { "code": "AR", "name": "Argentina" },
    { "code": "AM", "name": "Armenia" },
    { "code": "AU", "name": "Australia" },
    { "code": "AT", "name": "Austria" },
    { "code": "AZ", "name": "Azerbaijan" },
    { "code": "BS", "name": "Bahamas" },
    { "code": "BH", "name": "Bahrain" },
    { "code": "BD", "name": "Bangladesh" },
    { "code": "BB", "name": "Barbados" },
    { "code": "BY", "name": "Belarus" },
    { "code": "BE", "name": "Belgium" },
    { "code": "BZ", "name": "Belize" },
    { "code": "BJ", "name": "Benin" },
    { "code": "BT", "name": "Bhutan" },
    { "code": "BO", "name": "Bolivia" },
    { "code": "BA", "name": "Bosnia and Herzegovina" },
    { "code": "BW", "name": "Botswana" },
    { "code": "BR", "name": "Brazil" },
    { "code": "BN", "name": "Brunei" },
    { "code": "BG", "name": "Bulgaria" },
    { "code": "BF", "name": "Burkina Faso" },
    { "code": "BI", "name": "Burundi" },
    { "code": "CV", "name": "Cabo Verde" },
    { "code": "KH", "name": "Cambodia" },
    { "code": "CM", "name": "Cameroon" },
    { "code": "CA", "name": "Canada" },
    { "code": "CF", "name": "Central African Republic" },
    { "code": "TD", "name": "Chad" },
    { "code": "CL", "name": "Chile" },
    { "code": "CN", "name": "China" },
    { "code": "CO", "name": "Colombia" },
    { "code": "KM", "name": "Comoros" },
    { "code": "CG", "name": "Congo" },
    { "code": "CR", "name": "Costa Rica" },
    { "code": "HR", "name": "Croatia" },
    { "code": "CU", "name": "Cuba" },
    { "code": "CY", "name": "Cyprus" },
    { "code": "CZ", "name": "Czechia" },
    { "code": "DK", "name": "Denmark" },
    { "code": "DJ", "name": "Djibouti" },
    { "code": "DM", "name": "Dominica" },
    { "code": "DO", "name": "Dominican Republic" },
    { "code": "EC", "name": "Ecuador" },
    { "code": "EG", "name": "Egypt" },
    { "code": "SV", "name": "El Salvador" },
    { "code": "GQ", "name": "Equatorial Guinea" },
    { "code": "ER", "name": "Eritrea" },
    { "code": "EE", "name": "Estonia" },
    { "code": "SZ", "name": "Eswatini" },
    { "code": "ET", "name": "Ethiopia" },
    { "code": "FJ", "name": "Fiji" },
    { "code": "FI", "name": "Finland" },
    { "code": "FR", "name": "France" },
    { "code": "GA", "name": "Gabon" },
    { "code": "GM", "name": "Gambia" },
    { "code": "GE", "name": "Georgia" },
    { "code": "DE", "name": "Germany" },
    { "code": "GH", "name": "Ghana" },
    { "code": "GR", "name": "Greece" },
    { "code": "GD", "name": "Grenada" },
    { "code": "GT", "name": "Guatemala" },
    { "code": "GN", "name": "Guinea" },
    { "code": "GW", "name": "Guinea-Bissau" },
    { "code": "GY", "name": "Guyana" },
    { "code": "HT", "name": "Haiti" },
    { "code": "HN", "name": "Honduras" },
    { "code": "HU", "name": "Hungary" },
    { "code": "IS", "name": "Iceland" },
    { "code": "IN", "name": "India" },
    { "code": "ID", "name": "Indonesia" },
    { "code": "IR", "name": "Iran" },
    { "code": "IQ", "name": "Iraq" },
    { "code": "IE", "name": "Ireland" },
    { "code": "IL", "name": "Israel" },
    { "code": "IT", "name": "Italy" },
    { "code": "JM", "name": "Jamaica" },
    { "code": "JP", "name": "Jepang" },
    { "code": "JO", "name": "Jordan" },
    { "code": "KZ", "name": "Kazakhstan" },
    { "code": "KE", "name": "Kenya" },
    { "code": "KI", "name": "Kiribati" },
    { "code": "KW", "name": "Kuwait" },
    { "code": "KG", "name": "Kyrgyzstan" },
    { "code": "LA", "name": "Laos" },
    { "code": "LV", "name": "Latvia" },
    { "code": "LB", "name": "Lebanon" },
    { "code": "LS", "name": "Lesotho" },
    { "code": "LR", "name": "Liberia" },
    { "code": "LY", "name": "Libya" },
    { "code": "LI", "name": "Liechtenstein" },
    { "code": "LT", "name": "Lithuania" },
    { "code": "LU", "name": "Luxembourg" },
    { "code": "MG", "name": "Madagascar" },
    { "code": "MW", "name": "Malawi" },
    { "code": "MY", "name": "Malaysia" },
    { "code": "MV", "name": "Maldives" },
    { "code": "ML", "name": "Mali" },
    { "code": "MT", "name": "Malta" },
    { "code": "MH", "name": "Marshall Islands" },
    { "code": "MR", "name": "Mauritania" },
    { "code": "MU", "name": "Mauritius" },
    { "code": "MX", "name": "Mexico" },
    { "code": "FM", "name": "Micronesia" },
    { "code": "MD", "name": "Moldova" },
    { "code": "MC", "name": "Monaco" },
    { "code": "MN", "name": "Mongolia" },
    { "code": "ME", "name": "Montenegro" },
    { "code": "MA", "name": "Morocco" },
    { "code": "MZ", "name": "Mozambique" },
    { "code": "MM", "name": "Myanmar" },
    { "code": "NA", "name": "Namibia" },
    { "code": "NR", "name": "Nauru" },
    { "code": "NP", "name": "Nepal" },
    { "code": "NL", "name": "Netherlands" },
    { "code": "NZ", "name": "New Zealand" },
    { "code": "NI", "name": "Nicaragua" },
    { "code": "NE", "name": "Niger" },
    { "code": "NG", "name": "Nigeria" },
    { "code": "KP", "name": "North Korea" },
    { "code": "MK", "name": "North Macedonia" },
    { "code": "NO", "name": "Norway" },
    { "code": "OM", "name": "Oman" },
    { "code": "PK", "name": "Pakistan" },
    { "code": "PW", "name": "Palau" },
    { "code": "PA", "name": "Panama" },
    { "code": "PG", "name": "Papua New Guinea" },
    { "code": "PY", "name": "Paraguay" },
    { "code": "PE", "name": "Peru" },
    { "code": "PH", "name": "Philippines" },
    { "code": "PL", "name": "Poland" },
    { "code": "PT", "name": "Portugal" },
    { "code": "QA", "name": "Qatar" },
    { "code": "RO", "name": "Romania" },
    { "code": "RU", "name": "Russia" },
    { "code": "RW", "name": "Rwanda" },
    { "code": "KN", "name": "Saint Kitts and Nevis" },
    { "code": "LC", "name": "Saint Lucia" },
    { "code": "VC", "name": "Saint Vincent and the Grenadines" },
    { "code": "WS", "name": "Samoa" },
    { "code": "SM", "name": "San Marino" },
    { "code": "ST", "name": "Sao Tome and Principe" },
    { "code": "SA", "name": "Saudi Arabia" },
    { "code": "SN", "name": "Senegal" },
    { "code": "RS", "name": "Serbia" },
    { "code": "SC", "name": "Seychelles" },
    { "code": "SL", "name": "Sierra Leone" },
    { "code": "SG", "name": "Singapura" },
    { "code": "SK", "name": "Slovakia" },
    { "code": "SI", "name": "Slovenia" },
    { "code": "SB", "name": "Solomon Islands" },
    { "code": "SO", "name": "Somalia" },
    { "code": "ZA", "name": "South Africa" },
    { "code": "KR", "name": "South Korea" },
    { "code": "SS", "name": "South Sudan" },
    { "code": "ES", "name": "Spain" },
    { "code": "LK", "name": "Sri Lanka" },
    { "code": "SD", "name": "Sudan" },
    { "code": "SR", "name": "Suriname" },
    { "code": "SE", "name": "Sweden" },
    { "code": "CH", "name": "Switzerland" },
    { "code": "SY", "name": "Syria" },
    { "code": "TW", "name": "Taiwan" },
    { "code": "TJ", "name": "Tajikistan" },
    { "code": "TZ", "name": "Tanzania" },
    { "code": "TH", "name": "Thailand" },
    { "code": "TL", "name": "Timor-Leste" },
    { "code": "TG", "name": "Togo" },
    { "code": "TO", "name": "Tonga" },
    { "code": "TT", "name": "Trinidad and Tobago" },
    { "code": "TN", "name": "Tunisia" },
    { "code": "TR", "name": "Turkey" },
    { "code": "TM", "name": "Turkmenistan" },
    { "code": "TV", "name": "Tuvalu" },
    { "code": "UG", "name": "Uganda" },
    { "code": "UA", "name": "Ukraine" },
    { "code": "AE", "name": "United Arab Emirates" },
    { "code": "GB", "name": "United Kingdom" },
    { "code": "US", "name": "United States" },
    { "code": "UY", "name": "Uruguay" },
    { "code": "UZ", "name": "Uzbekistan" },
    { "code": "VU", "name": "Vanuatu" },
    { "code": "VE", "name": "Venezuela" },
    { "code": "VN", "name": "Vietnam" },
    { "code": "YE", "name": "Yemen" },
    { "code": "ZM", "name": "Zambia" },
    { "code": "ZW", "name": "Zimbabwe" }
]

    

    

