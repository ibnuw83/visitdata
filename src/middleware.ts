
'use server';

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // The client-side AuthProvider is now the single source of truth for auth.
  // The middleware is disabled to prevent conflicts.
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
