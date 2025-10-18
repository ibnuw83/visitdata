'use client';

import { 
    users as mockUsers, 
    destinations as mockDestinations, 
    visitData as mockVisitData, 
    unlockRequests as mockUnlockRequests,
    categories as mockCategories
} from './mock-data';
import type { User, Destination, VisitData, UnlockRequest, Category } from './types';

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

export function saveDestinations(destinations: Destination[]): void {
  try {
    localStorage.setItem('destinations', JSON.stringify(destinations));
  } catch (error) {
    console.error(`Error saving destinations to localStorage`, error);
  }
}

export function getVisitData(): VisitData[] {
    return initializeData('visitData', mockVisitData);
}

export function saveVisitData(data: VisitData[]): void {
  try {
    localStorage.setItem('visitData', JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving visit data to localStorage`, error);
  }
}

export function getUnlockRequests(): UnlockRequest[] {
    return initializeData('unlockRequests', mockUnlockRequests);
}

export function getCategories(): Category[] {
  return initializeData('categories', mockCategories);
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem('categories', JSON.stringify(categories));
  } catch (error) {
    console.error(`Error saving categories to localStorage`, error);
  }
}

// --- Combined Function for Server Actions ---

export function getAllData() {
    // This function is intended to be used where client-side access is guaranteed,
    // but we might need a way to get all data at once.
    return {
        users: getUsers(),
        destinations: getDestinations(),
        visitData: getVisitData(),
        unlockRequests: getUnlockRequests(),
        categories: getCategories()
    };
}

// In a real app, you would have functions to update the data as well.
// e.g., export function saveUsers(users: User[]): void { localStorage.setItem('users', JSON.stringify(users)); }
