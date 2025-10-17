'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';

// prevState is required for useActionState, but we don't use it here.
export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = users.find((u) => u.email === email);

  // CRITICAL: Validate user exists AND password is correct.
  if (user && password === 'password123') {
    // CRITICAL: Await session creation before redirecting.
    await createSession(user.uid);
    redirect('/dashboard');
  } else {
    return { error: 'Email atau kata sandi tidak valid.' };
  }
}

export async function logout() {
    await deleteSession();
    redirect('/');
}
