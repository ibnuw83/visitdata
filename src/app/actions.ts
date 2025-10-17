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
    // We don't redirect from here directly.
    // The middleware will handle the redirect after the session is created.
    // This helps avoid race conditions with cookie setting.
    return { success: true };
  } else {
    // In a real app, you would return an error message to the form.
    return { success: false, error: 'InvalidCredentials' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/');
}
