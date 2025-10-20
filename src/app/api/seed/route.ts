'use server';

import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { seedDatabase } from '../../../../seed/seed';


export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Seeding is only allowed in development environment.' }, { status: 403 });
  }

  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: 'Firebase Admin not initialized. Check server environment variables.' }, { status: 500 });
  }

  try {
    const result = await seedDatabase(adminDb, adminAuth);
    return NextResponse.json({
      message: 'Database seeding completed idempotently.',
      ...result,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
  }
}
