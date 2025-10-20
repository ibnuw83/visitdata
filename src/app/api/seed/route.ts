
'use server';

import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { seedDatabase } from '@/lib/seed-data';

export async function GET() {
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
