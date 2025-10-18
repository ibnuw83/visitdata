'use server';

import { createSession, deleteSession } from '@/lib/session';
import { User } from '@/lib/types';
import { getUsers } from '@/lib/local-data-service';

// This function is now handled on the client-side in AuthContext
export async function login(formData: FormData): Promise<{ success: boolean; user?: User | null; error?: string }> {
  return { success: false, error: "Login logic has moved to the client." };
}

export async function logout() {
  await deleteSession();
}

export async function createSessionForUser(uid: string) {
    await createSession(uid);
}
