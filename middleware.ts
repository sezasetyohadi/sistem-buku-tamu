import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const appMode = process.env.APP_MODE;
  const pathname = request.nextUrl.pathname;
  
  console.log('Middleware - Path:', pathname, 'Mode:', appMode);
  
  // Always allow login page - no authentication required
  if (pathname === '/admin/login') {
    console.log('Allowing access to login page');
    return NextResponse.next();
  }
  
  // Mode-specific routing
  if (appMode === 'admin') {
    // Block guest routes in admin mode
    if (pathname.startsWith('/guest') && !pathname.startsWith('/guest/dashboard')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Ensure admin authentication for ALL admin routes except login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const isAuthenticated = checkAdminAuthentication(request);
      console.log('Admin page access check - Authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        console.log('Redirecting to login - not authenticated');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }
  
  if (appMode === 'guest') {
    // Allow access to the main landing page ("/")
    if (pathname === '/') {
      return NextResponse.next();
    }
    
    // Block admin routes in guest mode
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/guest', request.url));
    }
  }
  
  // Original admin authentication logic for full mode
  if (!appMode || appMode === 'full') {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const isAuthenticated = checkAdminAuthentication(request);
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

function checkAdminAuthentication(request: NextRequest): boolean {
  try {
    // Check a simple cookie for authentication
    const authCookie = request.cookies.get('admin_auth');
    
    console.log('Middleware auth check - Cookie:', authCookie?.value);
    
    // Simple check - cookie should exist and have value 'true'
    return authCookie?.value === 'true';
  } catch (error) {
    console.error('Auth check error in middleware:', error);
    return false;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guest/:path*',
    '/api/:path*'
    // Removed '/' from matcher so it doesn't interfere with landing page
  ],
};
