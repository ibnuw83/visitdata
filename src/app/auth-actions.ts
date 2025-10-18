'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';

// The 'prevState' is required for useActionState, but we don't use it here.
export async function login(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // This handles the initial state before any submission
    if (!email && !password) {
        return { error: null };
    }

    const user = users.find((u) => u.email === email);

    if (user && password === 'password123') {
      await createSession(user.uid);
      return { success: true };
    } else {
      return { error: 'Email atau kata sandi tidak valid.' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'Terjadi kesalahan yang tidak terduga.' };
  }
}

export async function logout() {
    await deleteSession();
    redirect('/');
}
