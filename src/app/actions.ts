'use server';

import { redirect } from 'next/navigation';
import { users } from '@/lib/mock-data';
import { createSession, deleteSession } from '@/lib/session';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // In a real app, you'd hash the password and compare.
  // Here we do a simple lookup.
  const user = users.find((u) => u.email === email);

  // Simple password check for demo
  if (user && password === 'password123') {
    await createSession(user);
    redirect('/dashboard');
  } else {
    // In a real app, you would return an error message to the form.
    // For this example, we'll just redirect back with an error query param.
    redirect('/?error=InvalidCredentials');
  }
}

export async function logout() {
  await deleteSession();
  redirect('/');
}
