import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/jwt';
import { envValidator } from './src/lib/environment-validator';

export function middleware(request: NextRequest) {
  const appMode = process.env.APP_MODE;
  const pathname = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname;
  const requestUrl = request.nextUrl.origin;
  
  console.log('Middleware - Path:', pathname, 'Mode:', appMode, 'Host:', hostname, 'Origin:', requestUrl);
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  applySecurityHeaders(response, request);
  
  // HTTPS Enforcement for production
  if (shouldEnforceHttps(request)) {
    return enforceHttps(request);
  }

  // URL-based access control
  const urlAccessControl = checkUrlBasedAccess(request);
  if (urlAccessControl) {
    return urlAccessControl;
  }
  
  // Domain-based routing for production deployment
  if (process.env.NODE_ENV === 'production' && hostname) {
    console.log('Production mode - checking domain routing');
    
    // Check if domain indicates admin or guest based on actual domains
    const isAdminDomain = hostname.includes('admin-sistem-buku-tamu') || hostname.includes('admin.');
    const isGuestDomain = hostname.includes('guest-sistem-buku-tamu') || hostname.includes('guest.');
    
    console.log('Domain detection:', { hostname, isAdminDomain, isGuestDomain });
    
    if (isAdminDomain) {
      console.log('Admin domain detected:', hostname);
      // Admin domain should only serve admin routes
      if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && pathname !== '/favicon.ico') {
        console.log('Redirecting to admin from:', pathname);
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      
      // Block guest routes on admin domain
      if (pathname.startsWith('/guest')) {
        console.log('Blocking guest route on admin domain');
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } 
    else if (isGuestDomain) {
      console.log('Guest domain detected:', hostname);
      // Guest domain should only serve guest routes
      if (!pathname.startsWith('/guest') && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && pathname !== '/favicon.ico') {
        console.log('Redirecting to guest from:', pathname);
        return NextResponse.redirect(new URL('/guest', request.url));
      }
      
      // Block admin routes on guest domain
      if (pathname.startsWith('/admin')) {
        console.log('Blocking admin route on guest domain');
        return NextResponse.redirect(new URL('/guest', request.url));
      }
    }
    else {
      console.log('Main domain - allowing both routes');
      // Main domain allows both, but redirect root to appropriate section
      if (pathname === '/') {
        // You can choose default behavior for main domain
        return NextResponse.redirect(new URL('/guest', request.url));
      }
    }
  }
  
  // Always allow login page - no authentication required
  if (pathname === '/admin/login') {
    console.log('Allowing access to login page');
    return response;
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
  
  return response;
}

// URL-based Access Control
function checkUrlBasedAccess(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const requestUrl = request.nextUrl.origin;
  
  // Skip API routes, static files, and Next.js internal routes
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/uploads')) {
    return null;
  }

  // Get configured URLs from environment
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  const guestUrl = process.env.NEXT_PUBLIC_GUEST_URL;
  
  console.log('URL Access Control:', {
    requestUrl,
    adminUrl,
    guestUrl,
    pathname
  });

  // Check admin routes access
  if (pathname.startsWith('/admin')) {
    if (adminUrl && requestUrl !== adminUrl.replace(/\/$/, '')) {
      console.log('Blocking admin access - wrong URL:', requestUrl, 'expected:', adminUrl);
      
      // Allow access-denied page to load
      if (pathname === '/access-denied') {
        return null;
      }
      
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }
  
  // Check guest routes access
  if (pathname.startsWith('/guest')) {
    if (guestUrl && requestUrl !== guestUrl.replace(/\/$/, '')) {
      console.log('Blocking guest access - wrong URL:', requestUrl, 'expected:', guestUrl);
      
      // Allow access-denied page to load
      if (pathname === '/access-denied') {
        return null;
      }
      
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  // Check reset password page access
  if (pathname.startsWith('/reset-password-page')) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && requestUrl !== appUrl.replace(/\/$/, '')) {
      console.log('Blocking reset password access - wrong URL:', requestUrl, 'expected:', appUrl);
      
      // Allow access-denied page to load
      if (pathname === '/access-denied') {
        return null;
      }
      
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  return null;
}

// Security Functions
function shouldEnforceHttps(request: NextRequest): boolean {
  try {
    return envValidator.isHttpsEnforced() && request.nextUrl.protocol === 'http:';
  } catch {
    // If environment validation fails, don't enforce HTTPS to avoid breaking the app
    return false;
  }
}

function enforceHttps(request: NextRequest): NextResponse {
  const httpsUrl = new URL(request.url);
  httpsUrl.protocol = 'https:';
  
  return NextResponse.redirect(httpsUrl, {
    status: 301, // Permanent redirect
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  });
}

function applySecurityHeaders(response: NextResponse, request: NextRequest): void {
  // Basic security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // HSTS Header for HTTPS connections
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
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
    '/reset-password-page/:path*',
    '/access-denied',
    '/api/:path*'
    // Removed '/' from matcher so it doesn't interfere with landing page
  ],
};
