
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const userSession = await getSession();
    if (!userSession) {
      return new NextResponse(
        JSON.stringify({ error: 'No active session' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.json(userSession);
  } catch (error) {
    console.error('API session error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
