'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAdminIdleLogout } from '@/hooks/useIdleDetection';
import { authLogger, safeLog } from '@/lib/logger';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Enable idle detection only for authenticated admin pages (not login page)
  const shouldEnableIdleDetection = isAuthenticated && pathname !== '/admin/login';
  useAdminIdleLogout(shouldEnableIdleDetection);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run auth check after component is mounted
    if (!isMounted) return;

    const checkAuth = async () => {
      try {
        // Always allow login page without authentication
        if (pathname === '/admin/login') {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // For all other admin pages, check authentication via API
        authLogger.debug('Checking JWT authentication for:', pathname);
        
        try {
          const response = await fetch('/api/admin/me', {
            method: 'GET',
            credentials: 'include', // Include cookies
            cache: 'no-cache' // Prevent caching to get fresh auth status
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              safeLog.audit('JWT authentication successful', result.admin.username);
              setIsAuthenticated(true);
            } else {
              authLogger.debug('JWT authentication failed:', result.message);
              setIsAuthenticated(false);
              // Use window.location for immediate redirect to prevent loops
              if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
              }
              return;
            }
          } else {
            authLogger.debug('JWT authentication request failed with status:', response.status);
            setIsAuthenticated(false);
            // Use window.location for immediate redirect to prevent loops
            if (typeof window !== 'undefined') {
              window.location.href = '/admin/login';
            }
            return;
          }
        } catch (fetchError) {
          authLogger.error('Error checking JWT authentication:', fetchError);
          setIsAuthenticated(false);
          // Use window.location for immediate redirect to prevent loops
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
          return;
        }
      } catch (error) {
        authLogger.error('Auth check error:', error);
        setIsAuthenticated(false);
        if (pathname !== '/admin/login') {
          // Use window.location for immediate redirect to prevent loops
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure proper mounting
    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [pathname, router, isMounted]);

  // Show loading spinner while checking authentication or not yet mounted
  if (!isMounted || isLoading) {
    return <LoadingSpinner />;
  }

  // For login page, always render content without any admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For other admin pages, block access completely if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-md w-full text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu untuk mengakses panel admin.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            Pergi ke Login
          </button>
        </div>
      </div>
    );
  }

  // Render children only if authenticated
  return <>{children}</>;
}
