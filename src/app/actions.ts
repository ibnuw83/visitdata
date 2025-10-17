'use server';

import { redirect } from 'next/navigation';
import { createSession } from '@/lib/session';
import { users } from '@/lib/mock-data'; // Server actions can only access server-side data

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // In a real app, you'd hash the password and compare.
  // Here we do a simple lookup from the mock data, as server actions cannot access localStorage.
  const user = users.find((u) => u.email === email);

  // Simple password check for demo
  if (user && password === 'password123') {
    await createSession(user);
    redirect('/dashboard');
  } else {
    return { error: 'Email atau kata sandi tidak valid.' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/');
}
