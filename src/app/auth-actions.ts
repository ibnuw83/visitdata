'use server';

import { createSession, deleteSession, getCurrentUser } from '@/lib/session';
import { users } from '@/lib/mock-data';
import { User } from '@/lib/types';

export async function login(formData: FormData): Promise<User | null> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return null;
  }
  
  const user = users.find((u) => u.email === email);
  
  // In a real app, you'd be hashing and comparing passwords.
  // For this demo, we'll use a simple string comparison.
  if (user && password === 'password123') {
    await createSession(user.uid);
    return user;
  }
  
  return null;
}

export async function logout() {
  await deleteSession();
}
