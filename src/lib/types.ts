export type User = {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'pengelola';
  assignedLocations: string[]; // Array of destination IDs
  status: 'aktif' | 'nonaktif';
  avatarUrl: string;
};

export type Destination = {
  id: string;
  name: string;
  category: string; // Now a string to allow dynamic categories
  managementType: 'pemerintah' | 'swasta';
  manager: string; // uid of pengelola
  location: string;
  status: 'aktif' | 'nonaktif';
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
  id: string;
  destinationId: string;
  year: number;
  month: number; // 1-12
  monthName: string;
  wisnus: number; // Wisatawan Nusantara
  wisman: number; // Wisatawan Mancanegara (total)
  wismanDetails: WismanDetail[];
  eventVisitors: number;
  historicalVisitors: number;
  totalVisitors: number;
  locked: boolean;
  lastUpdatedBy?: string; // uid of user
  revisionRequests?: any[]; // Simplified for now
  verifiedBy?: string; // uid of admin
};

export type UnlockRequest = {
  id: string;
  destinationId: string;
  month: number;
  year: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string; // uid of pengelola
  processedBy?: string; // uid of admin
  timestamp: string;
};
