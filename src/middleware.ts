import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

const adminOnlyRoutes = ['/unlock-requests', '/categories', '/destinations', '/users'];
const pengelolaOnlyRoutes = ['/data-entry'];
const protectedRoutes = ['/dashboard', ...adminOnlyRoutes, ...pengelolaOnlyRoutes, '/reports', '/settings'];
const authRoute = '/';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const user = session?.user;
  const { pathname } = request.nextUrl;

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If user is logged in
  if (user) {
    // And tries to access the login page, redirect to dashboard
    if (pathname === authRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role-based access control for protected routes
    const userRole = user.role;
    if (userRole === 'pengelola' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (userRole === 'admin' && pengelolaOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not logged in
  else {
    // And is trying to access a protected route, redirect to login
    if (isAccessingProtectedRoute) {
      return NextResponse.redirect(new URL(authRoute, request.url));
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
