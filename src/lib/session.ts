'use server';
import 'server-only';

import { cookies } from 'next/headers';
import { User } from './types';
import { users as mockUsers } from './mock-data';

// Keep it simple: store only the UID in the cookie.
export async function createSession(uid: string | null) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + oneWeek);
  
  if (uid === null) {
    cookies().delete('session');
    return;
  }

  cookies().set('session', uid, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function getCurrentUser(): Promise<User | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }

    // In a real app, you'd fetch this from a database.
    const user = mockUsers.find(u => u.uid === sessionCookie);
    
    if (!user) {
        // The UID in the cookie is invalid, so delete the cookie.
        await createSession(null);
        return null;
    }
    
    return user;
}
