import { NextResponse } from 'next/server';
// Pastikan path ini benar menunjuk ke file seed.js di root project
import { seedDatabase } from '../../../../seed/seed.js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Lindungi route ini agar hanya bisa diakses di environment development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Seeding is only allowed in development environment.' }, { status: 403 });
  }

  try {
    const message = await seedDatabase();
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Seeding failed via API route:', error);
    return NextResponse.json({ success: false, message: error.message || 'An unknown error occurred during seeding.' }, { status: 500 });
  }
}
