'use server';
import 'server-only';

import { cookies } from 'next/headers';
import { User } from './types';
import { users as mockUsers } from './mock-data';

// This forces the functions in this file to be dynamically executed,
// preventing caching and ensuring the latest session cookie is always read.
export const dynamic = 'force-dynamic';

// For demo purposes, we're not actually encrypting. In production, use a library like 'iron-session'.
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

    // In a real app, this would be a database call.
    // Here we re-validate the user from mock data.
    const user = mockUsers.find(u => u.uid === session.user.uid);
    return user ?? null;
}
