'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

const protectedRoutes = ['/dashboard', '/categories', '/destinations', '/data-entry', '/reports', '/unlock-requests', '/users', '/settings'];
const publicRoute = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isAuthenticated = await verifySession();

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAccessingPublicRoute = pathname === publicRoute;

  // If user is not authenticated and is trying to access a protected route, redirect to login page.
  if (!isAuthenticated && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL(publicRoute, request.url));
  }

  // If user is authenticated and is trying to access the login page, redirect to dashboard.
  if (isAuthenticated && isAccessingPublicRoute) {
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
