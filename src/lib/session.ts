'use server';

import { cookies } from 'next/headers';
import { User } from './types';
import { users as mockUsers } from './mock-data'; // Keep mock as fallback

// This is a workaround since we can't directly import client-side services in server files.
// In a real app, this would be a database call.
function findUserByUid(uid: string): User | undefined {
    // This is not ideal as it reads the static mock data file.
    // A better approach in a real app is an API route or DB call.
    return mockUsers.find(u => u.uid === uid);
}


// For demo purposes, we're not actually encrypting. In production, use a library like 'iron-session'.
const secret = process.env.SESSION_SECRET || 'complex_secret_for_development_only_must_be_at_least_32_characters_long';

// Let's use a more robust (but still mock) encryption/decryption for demo purposes
async function encrypt(payload: any) {
  const data = JSON.stringify(payload);
  return Buffer.from(data).toString('base64');
}

async function decrypt(session: string) {
  const data = Buffer.from(session, 'base64').toString('utf-8');
  return JSON.parse(data);
}

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionData = { user, expires: expires.toISOString() };
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
    // Ensure expires is a Date object for comparison
    if (new Date(parsed.expires) > new Date()) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}

export async function deleteSession() {
  cookies().delete('session', { path: '/' });
}

export async function getCurrentUser(): Promise<User | null> {
    const session = await getSession();
    if (!session?.user?.uid) return null;
    
    // Re-validate user from mock data.
    // In a real app with a DB, this would be a DB query.
    // With localStorage, this check happens on the server, which can't access localStorage.
    // We rely on the mock data as the source of truth for the server.
    const user = findUserByUid(session.user.uid);
    return user ?? null;
}
