
import { NextResponse } from 'next/server';
// Ensure the path correctly points to the seed.js file in the root directory
import { seedDatabase } from '../../../../seed/seed.js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Protect this route to be accessible only in the development environment
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
