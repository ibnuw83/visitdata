import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

const protectedRoutes = ['/dashboard', '/data-entry', '/reports', '/unlock-requests', '/settings', '/categories', '/destinations', '/users'];
const adminOnlyRoutes = ['/unlock-requests', '/categories', '/destinations', '/users'];
const pengelolaOnlyRoutes = ['/data-entry'];

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If no session and trying to access a protected route, redirect to login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If session exists and user is on the login page, redirect to dashboard
  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (session) {
    const userRole = session.user.role;

    // If a 'pengelola' tries to access an admin-only route, redirect to dashboard
    if (userRole === 'pengelola' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If an 'admin' tries to access a 'pengelola'-only route, redirect to dashboard
    if (userRole === 'admin' && pengelolaOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
