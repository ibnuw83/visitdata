
import { User, Destination, Category, Country, VisitData } from './types';
import { PlaceHolderImages } from './placeholder-images';

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
    assignedLocations: ['dest-goa-jatijajar'],
    status: 'aktif',
    avatarUrl: PlaceHolderImages.find(p => p.id === 'user-2')?.imageUrl || '',
  },
   {
    name: 'Pengelola Suwuk',
    email: 'pengelola@suwuk.com',
    role: 'pengelola',
    assignedLocations: ['dest-pantai-suwuk'],
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
    { code: "SB", "name": "Solomon Islands" }, { code: "SO", "name": "Somalia" }, { code: "ZA", "name": "South Africa" },
    { code: "SS", "name": "South Sudan" }, { code: "ES", "name": "Spain" }, { code: "LK", "name": "Sri Lanka" },
    { code: "SD", "name": "Sudan" }, { code: "SR", "name": "Suriname" }, { code: "SE", "name": "Sweden" },
    { code: "CH", "name": "Switzerland" }, { code: "SY", "name": "Syria" }, { code: "TW", "name": "Taiwan" },
    { code: "TJ", "name": "Tajikistan" }, { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" },
    { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" },
    { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" },
    { code: "TM", name: "Turkmenistan" }, { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" },
    { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
    { code: "VU", name: "Vanuatu" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Viet Nam" },
    { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" }
];


// --- DATA KUNJUNGAN ---
export function generateSeedVisitData(destinations: (Destination & { id: string })[]): VisitData[] {
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
