'use client';

import { users as mockUsers, destinations as mockDestinations, visitData as mockVisitData, unlockRequests as mockUnlockRequests } from './mock-data';
import type { User, Destination, VisitData, UnlockRequest } from './types';

function initializeData<T>(key: string, mockData: T[]): T[] {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    } else {
      localStorage.setItem(key, JSON.stringify(mockData));
      return mockData;
    }
  } catch (error) {
    console.error(`Error initializing data for key ${key} from localStorage`, error);
    return mockData; // Fallback to mock data on error
  }
}

// --- Data Access Functions ---

export function getUsers(): User[] {
  return initializeData('users', mockUsers);
}

export function getDestinations(): Destination[] {
  return initializeData('destinations', mockDestinations);
}

export function getVisitData(): VisitData[] {
    return initializeData('visitData', mockVisitData);
}

export function getUnlockRequests(): UnlockRequest[] {
    return initializeData('unlockRequests', mockUnlockRequests);
}

// --- Combined Function for Server Actions ---

export function getAllData() {
    // This function is intended to be used where client-side access is guaranteed,
    // but we might need a way to get all data at once.
    return {
        users: getUsers(),
        destinations: getDestinations(),
        visitData: getVisitData(),
        unlockRequests: getUnlockRequests()
    };
}

// In a real app, you would have functions to update the data as well.
// e.g., export function saveUsers(users: User[]): void { localStorage.setItem('users', JSON.stringify(users)); }
