
'use server';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUsers } from '@/lib/local-data-service'; // Menggunakan sumber data yang sama dengan klien

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


/**
 * POST handler untuk memvalidasi kredensial pengguna.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email dan kata sandi harus diisi.' }, { status: 400 });
    }

    const users = getUsers(); // Mengambil data pengguna dari localStorage
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      return NextResponse.json({ success: false, message: 'Email atau kata sandi tidak valid.' }, { status: 401 });
    }

    // Kredensial valid, kembalikan UID
    return NextResponse.json({ success: true, uid: foundUser.uid });

  } catch (error) {
    console.error('API POST /api/session Error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

