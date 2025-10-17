import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/session';

const protectedRoutes = ['/dashboard', '/categories', '/destinations', '/data-entry', '/reports', '/unlock-requests', '/users', '/settings'];
const authRoute = '/';
const adminOnlyRoutes = ['/categories', '/destinations', '/users', '/unlock-requests'];
const pengelolaOnlyRoutes = ['/data-entry'];


export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();
  const { pathname } = request.nextUrl;

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!user && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL(authRoute, request.url));
  }

  // If user is logged in
  if (user) {
    // If they try to access the login page, redirect to dashboard
    if (pathname === authRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role-based access control
    const userRole = user.role;
    if (userRole === 'pengelola' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      // Pengelola trying to access admin-only route
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (userRole === 'admin' && pengelolaOnlyRoutes.some(route => pathname.startsWith(route))) {
      // Admin trying to access pengelola-only route
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
