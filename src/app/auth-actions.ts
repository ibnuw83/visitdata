'use server';

import { createSession, deleteSession } from '@/lib/session';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/local-data-service';

export async function login(formData: FormData): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: "Email dan kata sandi harus diisi." };
    }

    // Server-side validation against the source of truth
    const allUsers = getUsers();
    const foundUser = allUsers.find(u => u.email === email);
    
    if (foundUser && foundUser.password === password) {
      // If credentials are correct, create a server session cookie
      await createSession(foundUser.uid);
      // Return a clean user object without the password
      const { password: _, ...userToReturn } = foundUser;
      return { success: true, user: userToReturn };
    } else {
      return { success: false, error: 'Email atau kata sandi tidak valid.' };
    }
  } catch (e: any) {
    console.error("Login server action error:", e);
    return { success: false, error: e.message || 'Terjadi kesalahan saat login.' };
  }
}

export async function logout() {
  await deleteSession();
}

// This function is kept for its utility but is not used in the primary login flow anymore.
export async function createSessionForUser(uid: string) {
    await createSession(uid);
}
