'use server';

import { redirect } from 'next/navigation';
import { createSession } from '@/lib/session';

export async function logout() {
    await createSession(null);
    redirect('/');
}
