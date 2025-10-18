'use server';
import 'server-only';

import { cookies } from 'next/headers';
import { User } from './types';
// This file runs on the server, so it can't access localStorage.
// It relies on the initial mock data to find a user from a session ID.
// The auth-actions.ts is responsible for using the *latest* data from localStorage during the login process itself.
import { users as mockUsers } from './mock-data';
import { getUsers } from './local-data-service';


export async function createSession(uid: string) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + oneWeek);
  
  cookies().set('session', uid, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function deleteSession() {
    cookies().delete('session');
}

export async function getCurrentUser(): Promise<User | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    
    // On the server, we must rely on a stable data source.
    // We get the *current* user data (which might have been updated) from localStorage on the client.
    // Here, we just need to verify the user from the cookie exists.
    const allUsers = getUsers();
    const user = allUsers.find(u => u.uid === sessionCookie);
    
    if (!user) {
        await deleteSession();
        return null;
    }
    
    return user;
}

export async function verifySession(): Promise<boolean> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return false;
  }
  
  const allUsers = getUsers();
  const userExists = allUsers.some(u => u.uid === sessionCookie);

  if (!userExists) {
    await deleteSession();
    return false;
  }
  return true;
}
