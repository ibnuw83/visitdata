'use server';
import 'server-only';

import { cookies } from 'next/headers';
import { User } from './types';
import { users as mockUsers } from './mock-data';

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

// This function is safe for Server Components and Server Actions (Node.js runtime)
export async function getCurrentUser(): Promise<User | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }

    const user = mockUsers.find(u => u.uid === sessionCookie);
    
    if (!user) {
        // The UID in the cookie is invalid, so delete the cookie.
        await deleteSession();
        return null;
    }
    
    return user;
}

// This function is safe for Middleware (Edge runtime)
export async function verifySession(request: { cookies: { get: (name: string) => { value: string } | undefined } }): Promise<boolean> {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) {
    return false;
  }
  // In a real app, you'd verify the session against a database or an external service.
  // For this mock app, we just check if a user with this UID exists.
  const userExists = mockUsers.some(u => u.uid === sessionCookie);
  return userExists;
}
