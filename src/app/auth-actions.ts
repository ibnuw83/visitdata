'use server';

import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData): Promise<{ error: string | null }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan kata sandi harus diisi.' };
  }

  const user = users.find((u) => u.email === email);

  if (user && password === 'password123') {
    await createSession(user.uid);
    // Redirect is the correct way to navigate after a successful form action
    redirect('/dashboard'); 
  } else {
    return { error: 'Email atau kata sandi tidak valid.' };
  }
}

export async function logout() {
    await deleteSession();
    // Redirect after logout to ensure user is on the login page
    redirect('/');
}
