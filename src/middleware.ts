import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

const adminOnlyRoutes = ['/unlock-requests', '/categories', '/destinations', '/users'];
const pengelolaOnlyRoutes = ['/data-entry'];
const protectedRoutes = ['/dashboard', ...adminOnlyRoutes, ...pengelolaOnlyRoutes, '/reports', '/settings'];

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 1. Jika tidak ada sesi dan mencoba mengakses rute yang dilindungi -> redirect ke login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Jika ada sesi dan berada di halaman login -> redirect ke dashboard
  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Jika ada sesi, lakukan pengecekan peran (role)
  if (session) {
    const userRole = session.user.role;

    if (userRole === 'pengelola' && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (userRole === 'admin' && pengelolaOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 4. Jika tidak ada kondisi di atas yang terpenuhi, lanjutkan permintaan
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
