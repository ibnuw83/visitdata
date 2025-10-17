import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

const adminOnlyRoutes = ['/unlock-requests', '/categories', '/destinations', '/users'];
const pengelolaOnlyRoutes = ['/data-entry'];
const protectedRoutes = ['/dashboard', ...adminOnlyRoutes, ...pengelolaOnlyRoutes, '/reports', '/settings'];

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const user = session?.user;
  const { pathname } = request.nextUrl;

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If trying to access login page while logged in, redirect to dashboard
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If trying to access a protected route without a session, redirect to login
  if (!user && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Handle role-based access control if user is logged in
  if (user) {
    const userRole = user.role;

    // If a manager tries to access an admin-only route
    if (userRole === 'pengelola' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If an admin tries to access a manager-only route
    if (userRole === 'admin' && pengelolaOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If none of the above, continue as normal
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
