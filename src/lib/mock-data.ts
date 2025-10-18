import { User, Destination, VisitData, UnlockRequest, Category } from './types';

export const users: User[] = [
  {
    uid: 'admin-01',
    name: 'Admin Dinas',
    email: 'admin@dinas.com',
    role: 'admin',
    assignedLocations: [],
    status: 'aktif',
    avatar: 'user-1'
  },
  {
    uid: 'pengelola-01',
    name: 'Pengelola Jatijajar',
    email: 'pengelola@jatijajar.com',
    role: 'pengelola',
    assignedLocations: ['dest-01'],
    status: 'aktif',
    avatar: 'user-2'
  },
  {
    uid: 'pengelola-02',
    name: 'Pengelola Suwuk',
    email: 'pengelola@suwuk.com',
    role: 'pengelola',
    assignedLocations: ['dest-02', 'dest-03'],
    status: 'aktif',
    avatar: 'user-3'
  },
];

export const destinations: Destination[] = [
  {
    id: 'dest-01',
    name: 'Goa Jatijajar',
    category: 'alam',
    manager: 'pengelola-01',
    location: 'Jatijajar, Ayah, Kebumen',
    status: 'aktif',
  },
  {
    id: 'dest-02',
    name: 'Pantai Suwuk',
    category: 'alam',
    manager: 'pengelola-02',
    location: 'Suwuk, Puring, Kebumen',
    status: 'aktif',
  },
  {
    id: 'dest-03',
    name: 'Benteng Van der Wijck',
    category: 'sejarah',
    manager: 'pengelola-02',
    location: 'Gombong, Kebumen',
    status: 'aktif',
  },
    {
    id: 'dest-04',
    name: 'Pantai Menganti',
    category: 'alam',
    manager: 'pengelola-01',
    location: 'Karangduwur, Ayah, Kebumen',
    status: 'nonaktif',
    },
    {
    id: 'dest-05',
    name: 'Bukit Pentulu Indah',
    category: 'buatan',
    manager: 'pengelola-02',
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

export const visitData: VisitData[] = destinations.flatMap(dest => 
    Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const wisnus = Math.floor(Math.random() * (5000 - 500) + 500);
        const wisman = Math.floor(Math.random() * (500 - 10) + 10);
        const eventVisitors = dest.category === 'event' || dest.category === 'budaya' ? Math.floor(Math.random() * 1000) : 0;
        const historicalVisitors = dest.category === 'sejarah' ? Math.floor(Math.random() * 2000) : 0;
        const totalVisitors = wisnus + wisman + eventVisitors + historicalVisitors;
        
        return {
            id: `visit-${dest.id}-${2023}-${month}`,
            destinationId: dest.id,
            year: 2023,
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
            eventVisitors,
            historicalVisitors,
            totalVisitors,
            locked: month < new Date().getMonth() -1,
            lastUpdatedBy: dest.manager,
        };
    })
);

export const unlockRequests: UnlockRequest[] = [
    {
        id: 'req-01',
        destinationId: 'dest-01',
        month: 5,
        year: 2023,
        reason: 'Ada kesalahan input data wisman, perlu direvisi.',
        status: 'pending',
        requestedBy: 'pengelola-01',
        timestamp: new Date(2023, 5, 28).toISOString(),
    },
    {
        id: 'req-02',
        destinationId: 'dest-02',
        month: 4,
        year: 2023,
        reason: 'Data pengunjung event belum dimasukkan.',
        status: 'approved',
        requestedBy: 'pengelola-02',
        processedBy: 'admin-01',
        timestamp: new Date(2023, 5, 20).toISOString(),
    },
        {
        id: 'req-03',
        destinationId: 'dest-03',
        month: 3,
        year: 2023,
        reason: 'Revisi jumlah wisnus, data awal tidak akurat.',
        status: 'rejected',
        requestedBy: 'pengelola-02',
        processedBy: 'admin-01',
        timestamp: new Date(2023, 5, 15).toISOString(),
    }
];