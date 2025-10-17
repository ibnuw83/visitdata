'use server';

import { createSession } from '@/lib/session';
import { users } from '@/lib/mock-data'; // Server actions can only access server-side data

// prevState is required for useActionState, but we don't use it here.
export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = users.find((u) => u.email === email);

  // Simple password check for demo
  if (user && password === 'password123') {
    await createSession(user);
    // Return success state instead of redirecting
    return { success: true, error: null };
  } else {
    return { success: false, error: 'Email atau kata sandi tidak valid.' };
  }
}
