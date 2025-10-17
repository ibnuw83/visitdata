'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

const protectedRoutes = ['/dashboard', '/categories', '/destinations', '/data-entry', '/reports', '/unlock-requests', '/users', '/settings', '/ai-suggestions'];
const authRoute = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await verifySession(request);

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!isAuthenticated && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL(authRoute, request.url));
  }

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (isAuthenticated && pathname === authRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
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
