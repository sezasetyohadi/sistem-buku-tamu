import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check if user is authenticated (you might want to implement JWT or session checking here)
    const isAuthenticated = checkAdminAuthentication(request);
    
    if (!isAuthenticated) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
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
  ],
};
