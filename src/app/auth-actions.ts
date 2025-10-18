'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';

// The 'prevState' is required for useActionState, but we use the second argument `formData`
export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Don't run validation on initial render
  if (!email && !password) {
      return { error: null };
  }

  const user = users.find((u) => u.email === email);

  if (user && password === 'password123') {
    await createSession(user.uid);
    // This is a valid successful state for useActionState
    return { success: true, error: null };
  } else {
    return { error: 'Email atau kata sandi tidak valid.', success: false };
  }
}

export async function logout() {
    await deleteSession();
    redirect('/');
}
