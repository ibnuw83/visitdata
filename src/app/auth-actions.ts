'use server';

import { createSession } from '@/lib/session';

// This server action is now only responsible for creating the session cookie.
// The validation happens on the client side in AuthContext.
export async function loginAction(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    await createSession(uid);
    return { success: true };
  } catch (e: any) {
    console.error("Login server action error:", e);
    return { success: false, error: e.message || 'Terjadi kesalahan saat membuat sesi.' };
  }
}
