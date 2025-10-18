'use server';

import { createSession, deleteSession } from '@/lib/session';
import { users } from '@/lib/mock-data';
import { redirect } from 'next/navigation';

// Definisikan tipe untuk state yang dikembalikan oleh action
type LoginState = {
  error: string | null;
} | null;

// Ubah fungsi agar kompatibel dengan useActionState
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan kata sandi harus diisi.' };
  }

  const user = users.find((u) => u.email === email);

  // Logika validasi password yang benar untuk mock data
  if (user && password === 'password123') {
    await createSession(user.uid);
    // Redirect adalah cara yang benar untuk bernavigasi setelah form action berhasil.
    redirect('/dashboard'); 
  } else {
    return { error: 'Email atau kata sandi tidak valid.' };
  }
}

export async function logout() {
    await deleteSession();
    // Middleware akan menangani redirect ke halaman login setelah sesi dihapus.
    redirect('/');
}
