import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — Auth Guard
 *
 * Redirects unauthenticated users away from /app/* routes.
 * Checks for the existence of the access_token cookie.
 * This is a UX guard only — the real security boundary is the backend.
 */

const AUTH_COOKIE_NAME = 'access_token';
const LOGIN_PATH = '/login';

const PUBLIC_PREFIXES = [
  '/_next',
  '/api',
  '/icon.svg',
  '/favicon.ico',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // All paths outside /app are public (marketing, auth, legal)
  if (!pathname.startsWith('/app')) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // /app/* requires auth cookie
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);

  if (!hasAuthCookie) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.svg (browser assets)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg).*)',
  ],
};
