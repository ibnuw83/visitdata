import { NextResponse } from 'next/server';
import { seedDatabase } from '../../../../seed/seed';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error: any) {
    console.error('Seeding failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
