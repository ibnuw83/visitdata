'use server';

import { NextResponse, type NextRequest } from 'next/server';

// This is a temporary, simplified session verification for middleware
// to avoid runtime mismatch issues. It only checks for cookie existence.
async function verifySessionEdge(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get('session');
  // In a real app, this should be a proper JWT or session token verification
  return !!sessionCookie;
}


const protectedRoutes = ['/dashboard', '/categories', '/destinations', '/data-entry', '/reports', '/unlock-requests', '/users', '/settings', '/ai-suggestions'];
const authRoute = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isAuthenticated = await verifySessionEdge(request);

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
