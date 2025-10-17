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

export async function getCurrentUser(): Promise<User | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }

    const user = mockUsers.find(u => u.uid === sessionCookie);
    
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
  const userExists = mockUsers.some(u => u.uid === sessionCookie);
  if (!userExists) {
    await deleteSession();
    return false;
  }
  return true;
}
