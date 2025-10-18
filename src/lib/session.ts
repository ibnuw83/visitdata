
'use server';
import 'server-only';

import { cookies } from 'next/headers';

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
    
    // The server's only job is to confirm a session cookie exists and return the UID.
    // It does NOT validate the user against any data source.
    // The client (`AuthContext`) is responsible for fetching the real, up-to-date user
    // data from its own source of truth (localStorage) using this UID.
    return { uid: sessionCookie };
}

export async function verifySession(): Promise<boolean> {
  const sessionCookie = cookies().get('session')?.value;
  return !!sessionCookie;
}

