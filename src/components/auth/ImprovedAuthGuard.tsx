/**
 * Improved AuthGuard Component
 * Uses the new AuthContext for proper state management and session handling
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager } from '@/hooks/useSessionManager';
import { authLogger } from '@/lib/logger';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/admin/login',
  '/admin/forgot-password',
  '/guest',
  '/guest/register',
  '/guest/status',
  '/guest/survey',
];

// Loading component
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Memverifikasi autentikasi...</p>
      </div>
    </div>
  );
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const pathname = usePathname();

  // Determine if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Enable session management for authenticated admin routes
  const shouldEnableSessionManager = isAuthenticated && 
    pathname.startsWith('/admin') && 
    !isPublicRoute;

  useSessionManager({
    enabled: shouldEnableSessionManager,
    idleTimeout: 20 * 60 * 1000, // 20 minutes
    refreshBeforeExpiry: 5 * 60 * 1000, // 5 minutes
    warningTime: 2 * 60 * 1000, // 2 minutes
  });

  // Log authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        authLogger.debug(`User authenticated: ${user.username} on ${pathname}`);
      } else if (!isPublicRoute) {
        authLogger.debug(`Authentication required for: ${pathname}`);
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, isPublicRoute]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Allow access to public routes regardless of authentication status
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected admin routes, require authentication
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      // The AuthContext will handle redirecting to login
      return <AuthLoadingSpinner />;
    }

    // Show error state if there's an authentication error
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kesalahan Autentikasi</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    // User is authenticated, show protected content
    return <>{children}</>;
  }

  // For any other routes, allow access
  return <>{children}</>;
}

// Higher-order component for protecting specific pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; allowedRoles?: string[] } = {}
) {
  const { requireAuth = true } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return <AuthLoadingSpinner />;
    }

    if (requireAuth && !isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda harus login untuk mengakses halaman ini.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
