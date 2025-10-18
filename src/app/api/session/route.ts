
'use server';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * GET handler untuk mengambil sesi pengguna saat ini.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (session && session.uid) {
      return NextResponse.json({ uid: session.uid });
    }
    // Jika tidak ada sesi, kembalikan objek kosong sesuai ekspektasi client
    return NextResponse.json({});
  } catch (error) {
    console.error('API GET /api/session Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
