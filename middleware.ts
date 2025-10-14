import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/jwt';
import { envValidator } from './src/lib/environment-validator';

export function middleware(request: NextRequest) {
  const appMode = process.env.APP_MODE || process.env.NEXT_PUBLIC_APP_MODE;
  const pathname = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname;
  const requestUrl = request.nextUrl.origin;
  
  //console.log('Middleware - Path:', pathname, 'Mode:', appMode, 'Host:', hostname, 'Origin:', requestUrl);
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  applySecurityHeaders(response, request);
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // HTTPS Enforcement for production
  if (shouldEnforceHttps(request)) {
    return enforceHttps(request);
  }

  // Subdomain-based mode detection
  const detectedMode = detectModeFromSubdomain(hostname);
  const finalMode = detectedMode || appMode;
  
  //console.log('Mode detection - ENV:', appMode, 'Subdomain:', detectedMode, 'Final:', finalMode);

  // Mode-specific routing logic
  if (finalMode === 'admin') {
    // Admin deployment mode
    //console.log('Admin mode detected');
    
    // Redirect root to admin
    if (pathname === '/') {
      //console.log('Redirecting root to admin dashboard');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Block guest routes in admin deployment
    if (pathname.startsWith('/guest') || 
        pathname === '/register' || 
        pathname === '/visit') {
      //console.log('Blocking guest route in admin mode:', pathname);
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    
    // Ensure all non-admin routes redirect to admin (except access-denied and reset-password)
    if (!pathname.startsWith('/admin') && 
        !pathname.startsWith('/access-denied') &&
        !pathname.startsWith('/reset-password-page')) {
      //console.log('Redirecting to admin from:', pathname);
      return NextResponse.redirect(new URL(`/admin${pathname}`, request.url));
    }
    
    // Admin authentication check
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const isAuthenticated = checkAdminAuthentication(request);
      //console.log('Admin auth check - Authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        //console.log('Redirecting to admin login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }
  
  else if (finalMode === 'guest') {
    // Guest deployment mode
    //console.log('Guest mode detected');
    
    // Redirect root to guest landing
    if (pathname === '/') {
      //console.log('Redirecting root to guest landing');
      return NextResponse.redirect(new URL('/guest', request.url));
    }
    
    // Block admin routes in guest deployment
    if (pathname.startsWith('/admin')) {
      //console.log('Blocking admin route in guest mode:', pathname);
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    
    // Guest authentication for protected routes
    if (pathname.startsWith('/guest') && 
        pathname !== '/guest/register' && 
        pathname !== '/guest/landing' &&
        pathname !== '/guest') {
      const isAuthenticated = checkGuestAuthentication(request);
      //console.log('Guest auth check - Authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        //console.log('Redirecting to guest landing');
        return NextResponse.redirect(new URL('/guest/landing', request.url));
      }
    }
  }
  
  else {
    // Development or full mode
    //console.log('Development/full mode - allowing flexible routing');
    
    // Default routing for development
    if (pathname === '/') {
      //console.log('Redirecting root to guest landing');
      return NextResponse.redirect(new URL('/guest/landing', request.url));
    }
    
    // Always allow login page - no authentication required
    if (pathname === '/admin/login') {
      //console.log('Allowing access to login page');
      return response;
    }
    
    // Admin authentication for ALL admin routes except login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const isAuthenticated = checkAdminAuthentication(request);
      //console.log('Admin page access check - Authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        //console.log('Redirecting to login - not authenticated');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    
    // Guest authentication for protected guest routes
    if (pathname.startsWith('/guest') && 
        pathname !== '/guest/register' && 
        pathname !== '/guest/landing') {
      const isAuthenticated = checkGuestAuthentication(request);
      //console.log('Guest page access check - Authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        //console.log('Redirecting to guest landing - not authenticated');
        return NextResponse.redirect(new URL('/guest/landing', request.url));
      }
    }
  }
  
  return response;
}

// Detect mode from subdomain
function detectModeFromSubdomain(hostname: string): string | null {
  if (!hostname) return null;
  
  // Check for admin subdomain
  if (hostname.startsWith('admin.') || hostname.includes('admin-') || hostname.includes('-admin')) {
    return 'admin';
  }
  
  // Check for guest subdomain or main domain (default to guest)
  if (hostname.startsWith('guest.') || hostname.includes('guest-') || hostname.includes('-guest')) {
    return 'guest';
  }
  
  // For Vercel deployments, check hostname pattern
  if (hostname.includes('vercel.app')) {
    if (hostname.includes('admin')) {
      return 'admin';
    } else if (hostname.includes('guest')) {
      return 'guest';
    }
  }
  
  // Default behavior based on known patterns
  const adminPatterns = ['admin', 'panel', 'dashboard'];
  const guestPatterns = ['guest', 'visitor', 'public'];
  
  for (const pattern of adminPatterns) {
    if (hostname.includes(pattern)) {
      return 'admin';
    }
  }
  
  for (const pattern of guestPatterns) {
    if (hostname.includes(pattern)) {
      return 'guest';
    }
  }
  
  return null;
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
  
  /* console.log('URL Access Control:', {
    requestUrl,
    adminUrl,
    guestUrl,
    pathname
  }); */

  // Check admin routes access
  if (pathname.startsWith('/admin')) {
    if (adminUrl && requestUrl !== adminUrl.replace(/\/$/, '')) {
      //console.log('Blocking admin access - wrong URL:', requestUrl, 'expected:', adminUrl);
      
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
      //console.log('Blocking guest access - wrong URL:', requestUrl, 'expected:', guestUrl);
      
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
      //console.log('Blocking reset password access - wrong URL:', requestUrl, 'expected:', appUrl);
      
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
    
    //console.log('Middleware admin auth check - Token exists:', !!accessToken);
    
    if (!accessToken) {
      return false;
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      //console.log('Middleware admin auth check - Token verification failed');
      return false;
    }

    //console.log('Middleware admin auth check - Token valid for user:', payload.username);
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
    
    //console.log('Middleware guest auth check - Token exists:', !!accessToken);
    
    if (!accessToken) {
      return false;
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'guest-portal');
    
    if (!payload || payload.userType !== 'guest') {
      //console.log('Middleware guest auth check - Token verification failed');
      return false;
    }

    //console.log('Middleware guest auth check - Token valid for guest:', payload.guestId);
    return true;
    
  } catch (error) {
    console.error('Guest auth check error in middleware:', error);
    return false;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|static).*)',
  ],
};
