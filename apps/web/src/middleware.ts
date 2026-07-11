import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We can't strictly verify the JWT in the Edge runtime without jsonwebtoken which requires Node APIs.
  // The simplest check is whether the `refreshToken` cookie exists.
  // The backend will handle the actual validation and return 401 if it's invalid.
  
  const hasRefreshToken = request.cookies.has('refreshToken');
  
  // Protect specific routes
  const protectedRoutes = ['/profile', '/orders', '/checkout'];
  const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtected && !hasRefreshToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect_url', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Also prevent authenticated users from going to login/register pages
  const authRoutes = ['/login', '/register', '/otp'];
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isAuthRoute && hasRefreshToken) {
    // If they have a token, we assume they're logged in. If it's invalid, the API will fail 
    // and the Axios interceptor will clear it and redirect back to login.
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
