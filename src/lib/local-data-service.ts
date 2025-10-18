
'use client';

import { 
    users as mockUsers, 
    destinations as mockDestinations, 
    visitData as mockVisitData, 
    unlockRequests as mockUnlockRequests,
    categories as mockCategories,
    countries as mockCountries,
} from './mock-data';
import type { User, Destination, VisitData, UnlockRequest, Category, Country } from './types';
import { PlaceHolderImages } from './placeholder-images';

function dispatchStorageEvent() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
    }
}

function getData<T>(key: string, mockData: T[]): T[] {
  try {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        return JSON.parse(storedData);
      }
      // If no data in localStorage, seed it with mock data
      localStorage.setItem(key, JSON.stringify(mockData));
      return mockData;
    }
  } catch (error) {
    console.error(`Error getting data for key ${key} from localStorage`, error);
  }
  // Fallback for SSR or errors
  return mockData;
}

function saveData<T>(key: string, data: T[] | T): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
    dispatchStorageEvent(); // Dispatch event on every save
  } catch (error)
 {
    console.error(`Error saving data for key ${key} to localStorage`, error);
  }
}

// --- Data Reset Function ---
export function resetAndSeedData(): void {
    if (typeof window === 'undefined') return;
    
    const keysToReset = [
        'users', 'destinations', 'visitData', 'unlockRequests', 
        'categories', 'countries', 'destinationImageMap', 'appTitle',
        'logoUrl', 'appFooter', 'heroTitle', 'heroSubtitle'
    ];
    keysToReset.forEach(key => localStorage.removeItem(key));
    
    // Reseed with fresh mock data
    saveData('users', mockUsers);
    saveData('destinations', mockDestinations);
    saveData('visitData', mockVisitData);
    saveData('unlockRequests', mockUnlockRequests);
    saveData('categories', mockCategories);
    saveData('countries', mockCountries);

    // Seed the destination image map
    const initialImageMap: Record<string, string> = {};
    mockDestinations.forEach(dest => {
      const placeholder = PlaceHolderImages.find(p => dest.name.toLowerCase().includes(p.id.split('-')[1]));
      if (placeholder) {
        initialImageMap[dest.id] = placeholder.imageUrl;
      }
    });
    saveDestinationImageMap(initialImageMap);

    console.log('Local storage has been reset and seeded with fresh mock data.');
    dispatchStorageEvent(); // Notify all components about the reset
}


// --- Data Access Functions ---

export function getUsers(): User[] {
  return getData('users', mockUsers);
}

export function saveUsers(users: User[]): void {
  saveData('users', users);
}

export function getDestinations(): Destination[] {
  return getData('destinations', mockDestinations);
}

export function saveDestinations(destinations: Destination[]): void {
  saveData('destinations', destinations);
}

export function getVisitData(): VisitData[] {
    return getData('visitData', mockVisitData);
}

export function saveVisitData(data: VisitData[]): void {
  saveData('visitData', data);
}

export function getUnlockRequests(): UnlockRequest[] {
    return getData('unlockRequests', mockUnlockRequests);
}

export function saveUnlockRequests(requests: UnlockRequest[]): void {
    saveData('unlockRequests', requests);
}

export function getCategories(): Category[] {
  return getData('categories', mockCategories);
}

export function saveCategories(categories: Category[]): void {
  saveData('categories', categories);
}

export function getCountries(): Country[] {
  return getData('countries', mockCountries);
}

export function getDestinationImageMap(destinations: Destination[]): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const storedMap = localStorage.getItem('destinationImageMap');
    if (storedMap) {
        return JSON.parse(storedMap);
    }
    // Create and save a default map if it doesn't exist
    const defaultMap: Record<string, string> = {};
    destinations.forEach(dest => {
        const placeholder = PlaceHolderImages.find(p => dest.name.toLowerCase().includes(p.id.split('-')[1])) || PlaceHolderImages[0];
        if(placeholder) defaultMap[dest.id] = placeholder.imageUrl;
    });
    saveDestinationImageMap(defaultMap);
    return defaultMap;
}

export function saveDestinationImageMap(map: Record<string, string>): void {
    saveData('destinationImageMap', map);
}


// --- Combined Functions ---

export function getAllData() {
    return {
        users: getUsers(),
        destinations: getDestinations(),
        visitData: getVisitData(),
        unlockRequests: getUnlockRequests(),
        categories: getCategories(),
        countries: getCountries(),
        destinationImageMap: getDestinationImageMap(getDestinations()),
    };
}

export function saveAllData(data: {
    users: User[],
    destinations: Destination[],
    visitData: VisitData[],
    unlockRequests: UnlockRequest[],
    categories: Category[],
    countries: Country[],
    destinationImageMap?: Record<string, string>,
}) {
    saveUsers(data.users);
    saveDestinations(data.destinations);
    saveVisitData(data.visitData);
    saveUnlockRequests(data.unlockRequests);
    saveCategories(data.categories);
    saveData('countries', data.countries);
    if(data.destinationImageMap) {
        saveDestinationImageMap(data.destinationImageMap);
    } else {
        // create a default one
        const defaultMap: Record<string, string> = {};
        data.destinations.forEach(dest => {
            const placeholder = PlaceHolderImages.find(p => dest.name.toLowerCase().includes(p.id.split('-')[1])) || PlaceHolderImages[0];
            if(placeholder) defaultMap[dest.id] = placeholder.imageUrl;
        });
        saveDestinationImageMap(defaultMap);
    }
}
