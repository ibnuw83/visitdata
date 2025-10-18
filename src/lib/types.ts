export type User = {
  uid: string;
  name: string;
  email: string;
  password?: string; // Only for creation, won't be stored in Firestore
  role: 'admin' | 'pengelola';
  assignedLocations: string[]; // Array of destination IDs
  status: 'aktif' | 'nonaktif';
  avatarUrl: string;
};

export type Destination = {
  id: string;
  name: string;
  category: string; 
  managementType: 'pemerintah' | 'swasta';
  location: string;
  status: 'aktif' | 'nonaktif';
  imageUrl?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Country = {
  code: string;
  name: string;
};

export type WismanDetail = {
  country: string;
  count: number;
};

export type VisitData = {
  id: string; // {destinationId}-{year}-{month}
  destinationId: string;
  year: number;
  month: number; // 1-12
  monthName: string;
  wisnus: number; // Wisatawan Nusantara
  wisman: number; // Wisatawan Mancanegara (total)
  wismanDetails: WismanDetail[];
  totalVisitors: number;
  locked: boolean;
  lastUpdatedBy?: string; // uid of user
};

export type UnlockRequest = {
  id: string;
  destinationId: string;
  destinationName?: string; // For display purposes
  month: number;
  year: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string; // uid of pengelola
  requesterName?: string; // For display purposes
  processedBy?: string; // uid of admin
  timestamp: string;
};
