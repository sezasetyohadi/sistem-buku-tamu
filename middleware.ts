import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/jwt';

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
    
    // Allow access to guest registration and login pages
    if (pathname === '/guest/register' || pathname === '/guest/landing') {
      return NextResponse.next();
    }
    
    // Ensure guest authentication for protected guest routes
    if (pathname.startsWith('/guest') && 
        pathname !== '/guest/register' && 
        pathname !== '/guest/landing') {
      const isAuthenticated = checkGuestAuthentication(request);
      console.log('Guest page access check - Authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        console.log('Redirecting to guest landing - not authenticated');
        return NextResponse.redirect(new URL('/guest/landing', request.url));
      }
    }
    
    // Block admin routes in guest mode
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/guest', request.url));
    }
  }
  
  // Original admin authentication logic for full mode
  if (!appMode || appMode === 'full') {
    // Admin authentication
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const isAuthenticated = checkAdminAuthentication(request);
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    
    // Guest authentication for protected guest routes
    if (pathname.startsWith('/guest') && 
        pathname !== '/guest/register' && 
        pathname !== '/guest/landing') {
      const isAuthenticated = checkGuestAuthentication(request);
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/guest/landing', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

function checkAdminAuthentication(request: NextRequest): boolean {
  try {
    // Get JWT token from cookie
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    console.log('Middleware admin auth check - Token exists:', !!accessToken);
    
    if (!accessToken) {
      return false;
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      console.log('Middleware admin auth check - Token verification failed');
      return false;
    }

    console.log('Middleware admin auth check - Token valid for user:', payload.username);
    return true;
    
  } catch (error) {
    console.error('Admin auth check error in middleware:', error);
    return false;
  }
}

function checkGuestAuthentication(request: NextRequest): boolean {
  try {
    // Get JWT token from cookie
    const accessToken = request.cookies.get('guest_access_token')?.value;
    
    console.log('Middleware guest auth check - Token exists:', !!accessToken);
    
    if (!accessToken) {
      return false;
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'guest-portal');
    
    if (!payload || payload.userType !== 'guest') {
      console.log('Middleware guest auth check - Token verification failed');
      return false;
    }

    console.log('Middleware guest auth check - Token valid for guest:', payload.guestId);
    return true;
    
  } catch (error) {
    console.error('Guest auth check error in middleware:', error);
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
