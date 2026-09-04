import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // This boundary only performs an early cookie-presence check. Authorization
  // remains authoritative in the API, which validates the actual token.
  const hasRefreshToken = request.cookies.has('refreshToken');

  const protectedRoutes = ['/profile', '/orders', '/checkout'];
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtected && !hasRefreshToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect_url', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const authRoutes = ['/login', '/register', '/otp'];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isAuthRoute && hasRefreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
