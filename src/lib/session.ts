'use server';

import { cookies } from 'next/headers';
import { User } from './types';
import { users } from './mock-data';

// For demo purposes, we're not actually encrypting. In production, use a library like 'iron-session'.
const secret = process.env.SESSION_SECRET || 'complex_secret_for_development_only';

async function encrypt(payload: any) {
  // In a real app, this would be a proper JWT or encrypted session data.
  return JSON.stringify(payload);
}

async function decrypt(session: string) {
  // In a real app, this would decrypt and verify the session.
  return JSON.parse(session);
}

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ user, expires });

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
    return null;
  }
}

export async function deleteSession() {
  cookies().delete('session');
}

export async function getCurrentUser(): Promise<User | null> {
    const session = await getSession();
    return session?.user ?? null;
}
