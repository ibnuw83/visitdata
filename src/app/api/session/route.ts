
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    // Kalau session ada, kembalikan uid user yang sedang login
    if (session && session.uid) {
      return NextResponse.json({ uid: session.uid });
    }

    // Kalau tidak ada session (belum login)
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Gagal membaca sesi pengguna.' }, { status: 401 });
  }
}
