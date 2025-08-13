import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const appMode = process.env.APP_MODE;
  const pathname = request.nextUrl.pathname;
  
  // Mode-specific routing
  if (appMode === 'admin') {
    // Block guest routes in admin mode
    if (pathname.startsWith('/guest') && !pathname.startsWith('/guest/dashboard')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Ensure admin authentication for admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const isAuthenticated = checkAdminAuthentication(request);
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }
  
  if (appMode === 'guest') {
    // Block admin routes in guest mode
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/guest', request.url));
    }
  }
  
  // Original admin authentication logic for full mode
  if (!appMode || appMode === 'full') {
    if (pathname.startsWith('/admin')) {
      const isAuthenticated = checkAdminAuthentication(request);
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

function checkAdminAuthentication(request: NextRequest): boolean {
  // For now, we'll check a simple cookie or header
  // In a real app, you'd want to verify JWT tokens or sessions
  const authCookie = request.cookies.get('admin_auth');
  const authHeader = request.headers.get('authorization');
  
  // Simple check - in production, verify the token properly
  return !!(authCookie || authHeader);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*',
    '/api/:path*'
  ],
};
