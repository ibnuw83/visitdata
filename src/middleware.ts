'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';


const protectedRoutes = ['/dashboard', '/categories', '/destinations', '/data-entry', '/reports', '/unlock-requests', '/users', '/settings'];
const authRoute = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isAuthenticated = await verifySession();

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAccessingAuthRoute = pathname === authRoute;

  // Jika pengguna tidak diautentikasi dan mencoba mengakses rute yang dilindungi, alihkan ke halaman login
  if (!isAuthenticated && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL(authRoute, request.url));
  }

  // Jika pengguna diautentikasi dan mencoba mengakses halaman login, alihkan ke dasbor
  if (isAuthenticated && isAccessingAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  /*
   * Cocokkan semua jalur permintaan kecuali yang dimulai dengan:
   * - api (rute API)
   * - _next/static (file statis)
   * - _next/image (file optimasi gambar)
   * - favicon.ico (file favicon)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
