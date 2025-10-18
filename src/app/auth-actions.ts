'use server';

import { createSession, deleteSession } from '@/lib/session';
import { User } from '@/lib/types';
import { users } from '@/lib/mock-data'; // Use server-side mock data for validation

export async function login(formData: FormData): Promise<User | null> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return null;
  }
  
  // In a real app, you would fetch from a database.
  // Here, we simulate it by checking against a stable, server-accessible list.
  // The full, updated user object will be managed by the client-side AuthProvider.
  const user = users.find((u) => u.email === email);
  
  // For this demo, we'll use a simple string comparison.
  // In a real app, you'd be hashing and comparing passwords.
  if (user && password === user.password) {
    await createSession(user.uid);
    // The client will fetch the *latest* version of the user from local storage.
    // This just confirms the login was successful.
    return user;
  }
  
  return null;
}

export async function logout() {
  await deleteSession();
}
