
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

function initializeData<T>(key: string, mockData: T[]): T[] {
  try {
    if (typeof window !== 'undefined') {
        // For 'users', always clear old data to ensure mock data passwords are correct on reload.
        // This is the definitive fix for the persistent "invalid password" error.
        if (key === 'users') {
            localStorage.removeItem('users');
        }

        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            localStorage.setItem(key, JSON.stringify(mockData));
            return mockData;
        }
    }
  } catch (error) {
    console.error(`Error initializing data for key ${key} from localStorage`, error);
  }
  // Return mockData as a fallback for server-side rendering or in case of client-side errors.
  return mockData;
}


function saveData<T>(key: string, data: T[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key ${key} to localStorage`, error);
  }
}


// --- Data Access Functions ---

export function getUsers(): User[] {
  return initializeData('users', mockUsers);
}

export function saveUsers(users: User[]): void {
  saveData('users', users);
}

export function getDestinations(): Destination[] {
  return initializeData('destinations', mockDestinations);
}

export function saveDestinations(destinations: Destination[]): void {
  saveData('destinations', destinations);
}

export function getVisitData(): VisitData[] {
    return initializeData('visitData', mockVisitData);
}

export function saveVisitData(data: VisitData[]): void {
  saveData('visitData', data);
}

export function getUnlockRequests(): UnlockRequest[] {
    return initializeData('unlockRequests', mockUnlockRequests);
}

export function saveUnlockRequests(requests: UnlockRequest[]): void {
    saveData('unlockRequests', requests);
}


export function getCategories(): Category[] {
  return initializeData('categories', mockCategories);
}

export function saveCategories(categories: Category[]): void {
  saveData('categories', categories);
}

export function getCountries(): Country[] {
  return initializeData('countries', mockCountries);
}

// --- Combined Functions ---

export function getAllData() {
    return {
        users: getUsers(),
        destinations: getDestinations(),
        visitData: getVisitData(),
        unlockRequests: getUnlockRequests(),
        categories: getCategories(),
        countries: getCountries()
    };
}

export function saveAllData(data: {
    users: User[],
    destinations: Destination[],
    visitData: VisitData[],
    unlockRequests: UnlockRequest[],
    categories: Category[],
    countries: Country[],
}) {
    saveUsers(data.users);
    saveDestinations(data.destinations);
    saveVisitData(data.visitData);
    saveUnlockRequests(data.unlockRequests);
    saveCategories(data.categories);
    saveData('countries', data.countries);
}
