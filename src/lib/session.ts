
'use server';

import { cookies } from 'next/headers';

const SESSION_KEY = 'visitdata.session';

export async function createSession(uid: string) {
  cookies().set(SESSION_KEY, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export async function getSession() {
  const cookie = cookies().get(SESSION_KEY);
  if (!cookie) return null;
  return { uid: cookie.value };
}

export async function deleteSession() {
  cookies().delete(SESSION_KEY);
}
