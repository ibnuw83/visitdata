'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/session';

// This forces the middleware to be dynamic, preventing caching of `getCurrentUser`
export const dynamic = 'force-dynamic';

const protectedRoutes = ['/dashboard', '/categories', '/destinations', '/data-entry', '/reports', '/unlock-requests', '/users', '/settings'];
const authRoute = '/';

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();
  const { pathname } = request.nextUrl;

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!user && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL(authRoute, request.url));
  }

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (user && pathname === authRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Role-based access control can be handled more gracefully in the UI,
  // but a middleware layer is good for security.
  if (user) {
    const adminOnlyRoutes = ['/categories', '/destinations', '/users', '/unlock-requests'];
    const pengelolaOnlyRoutes = ['/data-entry'];

    if (user.role === 'pengelola' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (user.role === 'admin' && pengelolaOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
