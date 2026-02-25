import { NextRequest, NextResponse } from 'next/server';

const LOGIN_PATH = '/login';
const DASHBOARD_ROOT = '/';

function hasAuthCookie(request: NextRequest): boolean {
  const access = request.cookies.get('access_token')?.value;
  const refresh = request.cookies.get('refresh_token')?.value;
  return Boolean(access || refresh);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasAuthCookie(request);
  const isProtectedPath =
    pathname === '/' || pathname === '/profile' || pathname.startsWith('/forms');

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === LOGIN_PATH && isAuthenticated) {
    const dashboardUrl = new URL(DASHBOARD_ROOT, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/', '/profile', '/forms/:path*'],
};
