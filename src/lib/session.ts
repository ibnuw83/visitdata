'use server';
import 'server-only';

import { cookies } from 'next/headers';
import { User } from './types';
import { users as mockUsers } from './mock-data';

// For demo purposes, we're not actually encrypting. In production, use a library like 'iron-session'.
async function encrypt(payload: any) {
  if (payload === null) {
    return "";
  }
  const data = JSON.stringify(payload);
  return Buffer.from(data).toString('base64');
}

async function decrypt(session: string | undefined) {
  if (!session) return null;
  try {
    const data = Buffer.from(session, 'base64').toString('utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to decrypt session', e);
    return null;
  }
}

export async function createSession(user: User | null) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionData = user ? { user, expires: expires.toISOString() } : null;
  const session = await encrypt(sessionData);

  cookies().set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function getSession(): Promise<{ user: User } | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const parsed = await decrypt(sessionCookie);
    // Check for expiration
    if (!parsed || !parsed.expires || new Date(parsed.expires) <= new Date()) {
      // Explicitly delete expired cookie
      cookies().delete('session');
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}


export async function getCurrentUser(): Promise<User | null> {
    const session = await getSession();
    if (!session?.user?.uid) {
        return null;
    }

    // In a real app, this would be a database call.
    // Here we re-validate the user from mock data.
    const user = mockUsers.find(u => u.uid === session.user.uid);
    
    // If user is not found in our "DB", invalidate the session.
    if (!user) {
        await createSession(null);
        return null;
    }
    
    return user;
}
