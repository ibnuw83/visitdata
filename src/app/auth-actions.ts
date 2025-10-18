'use server';

import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/local-data-service';

export async function login(formData: FormData): Promise<User | null> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return null;
  }
  
  // In a real app, always get the latest user data
  const currentUsers = getUsers();
  const user = currentUsers.find((u) => u.email === email);
  
  // For this demo, we'll use a simple string comparison.
  // In a real app, you'd be hashing and comparing passwords.
  if (user && password === user.password) {
    await createSession(user.uid);
    return user;
  }
  
  return null;
}

export async function logout() {
  await deleteSession();
}
