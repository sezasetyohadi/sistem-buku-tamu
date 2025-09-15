'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAdminIdleLogout } from '@/hooks/useIdleDetection';
import { authLogger, safeLog } from '@/lib/logger';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Enable idle detection only for authenticated admin pages (not login page)
  const shouldEnableIdleDetection = isAuthenticated && pathname !== '/admin/login';
  useAdminIdleLogout(shouldEnableIdleDetection);

  useEffect(() => {
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
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              safeLog.audit('JWT authentication successful', result.admin.username);
              setIsAuthenticated(true);
            } else {
              authLogger.debug('JWT authentication failed:', result.message);
              setIsAuthenticated(false);
              router.replace('/admin/login');
            }
          } else {
            authLogger.debug('JWT authentication request failed with status:', response.status);
            setIsAuthenticated(false);
            router.replace('/admin/login');
          }
        } catch (fetchError) {
          authLogger.error('Error checking JWT authentication:', fetchError);
          setIsAuthenticated(false);
          router.replace('/admin/login');
        }
      } catch (error) {
        authLogger.error('Auth check error:', error);
        setIsAuthenticated(false);
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [pathname, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Memverifikasi akses...</p>
        </div>
      </div>
    );
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
