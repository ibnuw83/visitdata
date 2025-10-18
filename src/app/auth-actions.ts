'use server';

import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan kata sandi harus diisi.' };
  }

  const user = users.find((u) => u.email === email);

  if (user && password === 'password123') {
    await createSession(user.uid);
    return { success: true };
  } else {
    return { error: 'Email atau kata sandi tidak valid.' };
  }
}

export async function logout() {
    await deleteSession();
    redirect('/');
}
