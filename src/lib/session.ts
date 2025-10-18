
'use server';
import 'server-only';

import { cookies } from 'next/headers';

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

export async function getCurrentUser(): Promise<{ uid: string } | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    
    return { uid: sessionCookie };
}

export async function verifySession(): Promise<boolean> {
  const sessionCookie = cookies().get('session')?.value;
  return !!sessionCookie;
}
