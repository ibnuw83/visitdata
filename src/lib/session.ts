
'use server';
import 'server-only';

import { cookies } from 'next/headers';
import { User } from './types';
// This file runs on the server, so it can't access localStorage.
// It relies on the initial mock data to find a user from a session ID.
// The AuthProvider on the client is responsible for getting the *latest* data.
import { users as mockUsers } from './mock-data';


export async function createSession(uid: string) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + oneWeek);
  
  // The session only stores the UID. The client-side AuthProvider is the source of truth for the user object.
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

export async function getCurrentUser(): Promise<{ uid: string } | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    
    // The server only needs to know the UID exists in the session.
    // The client will fetch the full, up-to-date user object from its own storage.
    const userExistsInInitialData = mockUsers.some(u => u.uid === sessionCookie);

    // This check against mock data is a fallback. The main source of truth is the client.
    // A user created on the client won't be in mockUsers, but their session is still valid
    // as long as the cookie exists. We return the UID for the client to handle.
    
    // For now, we return the UID directly from the cookie.
    return { uid: sessionCookie };
}

export async function verifySession(): Promise<boolean> {
  const sessionCookie = cookies().get('session')?.value;
  return !!sessionCookie;
}
