'use server';

import { createSession, deleteSession } from '@/lib/session';

export async function loginAction(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    await createSession(uid);
    return { success: true };
  } catch (e: any) {
    console.error("Login server action error:", e);
    return { success: false, error: e.message || 'Terjadi kesalahan pada server' };
  }
}

export async function logoutAction(): Promise<void> {
    await deleteSession();
}
