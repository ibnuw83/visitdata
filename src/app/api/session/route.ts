
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json(session || {});
  } catch (e) {
    console.error('Session API error:', e);
    return NextResponse.json({}, { status: 401 });
  }
}
