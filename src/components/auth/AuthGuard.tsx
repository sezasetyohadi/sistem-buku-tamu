"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Always allow login page without authentication
        if (pathname === '/admin/login') {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // For all other admin pages, check authentication
        console.log('Checking authentication for:', pathname);
        
        // Check localStorage for admin session
        const adminSession = localStorage.getItem('admin_session');
        
        // Check cookie for admin auth
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('admin_auth='));

        console.log('Auth check - Session exists:', !!adminSession, 'Cookie exists:', !!authCookie);

        if (adminSession && authCookie) {
          try {
            const sessionData = JSON.parse(adminSession);
            
            // Check if session is not expired (24 hours)
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
            
            console.log('Session time check - Hours since login:', hoursDiff);
            
            if (hoursDiff < 24) {
              console.log('Authentication successful');
              setIsAuthenticated(true);
            } else {
              console.log('Session expired, clearing data');
              // Session expired, clear it
              localStorage.removeItem('admin_session');
              document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              setIsAuthenticated(false);
              router.push('/admin/login');
            }
          } catch (parseError) {
            console.error('Session parse error:', parseError);
            localStorage.removeItem('admin_session');
            document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            setIsAuthenticated(false);
            router.push('/admin/login');
          }
        } else {
          console.log('No valid session found, redirecting to login');
          setIsAuthenticated(false);
          // Only redirect if not already on login page
          if (pathname !== '/admin/login') {
            router.replace('/admin/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
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
