'use server';

import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';

export async function login(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email dan kata sandi harus diisi.' };
  }

  const user = users.find((u) => u.email === email);

  if (user && password === 'password123') {
    await createSession(user.uid);
    return { success: true };
  } else {
    return { success: false, error: 'Email atau kata sandi tidak valid.' };
  }
}

export async function logout() {
    await deleteSession();
    // Redirect will be handled by the middleware
}
