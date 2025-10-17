import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// We will keep the role-based redirects and the redirect from / to /dashboard here.
// The primary session check will now live in the layout.
const adminOnlyRoutes = ['/unlock-requests', '/categories', '/destinations', '/users'];
const pengelolaOnlyRoutes = ['/data-entry'];

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // If session exists and user is on the login page, redirect to dashboard.
  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If no session and user is on the login page, allow them to proceed.
  if (!session && pathname === '/') {
    return NextResponse.next();
  }

  // Handle role-based authorization for logged-in users.
  if (session) {
    const userRole = session.user.role;

    // If a 'pengelola' tries to access an admin-only route, redirect to their dashboard.
    if (userRole === 'pengelola' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If an 'admin' tries to access a 'pengelola'-only route, redirect to their dashboard.
    if (userRole === 'admin' && pengelolaOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Fallback for protected routes if session is somehow missed, redirect to login.
  const protectedRoutes = ['/dashboard', '/data-entry', '/reports', '/unlock-requests', '/settings', '/categories', '/destinations', '/users'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!session && isProtectedRoute) {
     return NextResponse.redirect(new URL('/', request.url));
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
