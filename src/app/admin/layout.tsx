'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import AuthGuard from '../../components/auth/AuthGuard';
import { SectionErrorBoundary } from '../../components/error/ErrorBoundary';
import { getAdminData, clearAdminSessionAndRedirect } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Route prefetching cache with performance optimizations
const routeCache = new Map<string, Promise<any>>();
const prefetchTimestamps = new Map<string, number>();
const PREFETCH_CACHE_TTL = 60000; // 1 minute
const PREFETCH_DEBOUNCE_DELAY = 200; // 200ms

// Advanced prefetch function with caching and debouncing
const prefetchRoute = (path: string) => {
  const now = Date.now();
  const lastPrefetch = prefetchTimestamps.get(path) || 0;
  
  // Skip if recently prefetched
  if (now - lastPrefetch < PREFETCH_DEBOUNCE_DELAY) {
    return;
  }
  
  // Check if cache is still valid
  if (routeCache.has(path)) {
    const cacheAge = now - lastPrefetch;
    if (cacheAge < PREFETCH_CACHE_TTL) {
      return; // Use cached version
    } else {
      routeCache.delete(path); // Clear expired cache
    }
  }
  
  prefetchTimestamps.set(path, now);
  
  // Create prefetch promise with retry logic
  const prefetchPromise = fetch(path, {
    method: 'GET',
    headers: {
      'x-prefetch': 'true',
      'Cache-Control': 'max-age=300' // 5 minute browser cache
    }
  }).catch((error) => {
    console.debug('Prefetch failed for:', path, error);
    // Remove failed cache entry
    routeCache.delete(path);
    prefetchTimestamps.delete(path);
  });
  
  routeCache.set(path, prefetchPromise);
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = React.useState<string>('');
  const [adminInitial, setAdminInitial] = React.useState<string>('');
  const [adminProfilePicture, setAdminProfilePicture] = React.useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [isProfileLoaded, setIsProfileLoaded] = React.useState(false);
  const [bidangTujuanId, setBidangTujuanId] = React.useState<number>(999);
  const [hasRedirected, setHasRedirected] = React.useState(false); // Add redirect tracking

  // Memoize role-based restrictions to avoid recalculation
  const roleRestrictions = React.useMemo(() => {
    return {
      kepala_dinas: {
        id: 2,
        allowedPaths: ['/admin/reports', '/admin/guest-list', '/admin/profile'],
        restrictedPaths: ['/admin', '/admin/guest-management', '/admin/survey'],
        defaultPath: '/admin/reports'
      },
      admin_resepsionis: {
        id: 999,
        allowedPaths: ['/admin', '/admin/guest-management', '/admin/reports', '/admin/survey', '/admin/profile'],
        restrictedPaths: ['/admin/guest-list'],
        defaultPath: '/admin'
      },
      admin_bidang: {
        allowedPaths: ['/admin/guest-list', '/admin/reports', '/admin/profile'],
        restrictedPaths: ['/admin', '/admin/guest-management', '/admin/survey'],
        defaultPath: '/admin/guest-list'
      }
    };
  }, []);

  // Function to check if redirect is needed
  const getRedirectPath = React.useCallback((bidangId: number, currentPath: string) => {
    const restrictions = bidangId === 2 ? roleRestrictions.kepala_dinas :
                        bidangId === 999 ? roleRestrictions.admin_resepsionis :
                        roleRestrictions.admin_bidang;

    // Check if current path is explicitly restricted
    const isOnRestrictedPath = restrictions.restrictedPaths.some(path => {
      if (path === '/admin') {
        return currentPath === '/admin' || currentPath === '/admin/';
      }
      return currentPath.startsWith(path);
    });

    // Check if current path is in allowed paths
    const isOnAllowedPath = restrictions.allowedPaths.some(path => {
      if (path === '/admin') {
        return currentPath === '/admin' || currentPath === '/admin/';
      }
      return currentPath.startsWith(path);
    });

    // If on restricted path OR not on allowed path, redirect to default
    if (isOnRestrictedPath || !isOnAllowedPath) {
      return restrictions.defaultPath;
    }

    return null;
  }, [roleRestrictions]);

  // Enhanced prefetch function that uses the router instance
  const enhancedPrefetch = React.useCallback((path: string) => {
    // Use the fetch-based prefetch
    prefetchRoute(path);
    
    // Also use Next.js router prefetch
    if (router.prefetch) {
      router.prefetch(path);
    }
  }, [router]);

  // Warm up critical routes on component mount
  React.useEffect(() => {
    const warmUpRoutes = () => {
      const criticalRoutes = [pathname]; // Current route first
      const currentIndex = ['/admin', '/admin/guest-management', '/admin/reports', '/admin/survey'].indexOf(pathname);
      
      // Add likely next routes based on current location
      if (currentIndex !== -1) {
        const nextRoutes = ['/admin/guest-management', '/admin/reports', '/admin/survey', '/admin/profile'];
        criticalRoutes.push(...nextRoutes.filter(route => route !== pathname));
      }
      
      // Prefetch with staggered delays to avoid overwhelming the browser
      criticalRoutes.forEach((route, index) => {
        setTimeout(() => {
          enhancedPrefetch(route);
        }, index * 50); // 50ms between each prefetch
      });
    };

    // Wait a bit for initial page load to settle
    const timeoutId = setTimeout(warmUpRoutes, 500);
    return () => clearTimeout(timeoutId);
  }, [pathname, enhancedPrefetch]);

  React.useEffect(() => {
    // Get admin session data when component mounts
    const fetchAdminData = async (retryCount = 0) => {
      try {
        setIsLoadingProfile(true);
        console.log(`Admin Layout: Fetching admin data (attempt ${retryCount + 1})...`);
        const adminData = await getAdminData();
        
        if (adminData) {
          console.log('Admin Layout: Got admin data:', { 
            nama_lengkap: adminData.nama_lengkap, 
            username: adminData.username,
            profile_picture: adminData.profile_picture,
            bidang_tujuan_id: adminData.bidang_tujuan_id
          });
          
          // Check if bidang_tujuan_id changed (user switched roles)
          const currentBidangId = adminData.bidang_tujuan_id || 999;
          if (bidangTujuanId !== currentBidangId) {
            console.log(`Admin Layout: Role changed from ${bidangTujuanId} to ${currentBidangId} - resetting redirect flag`);
            setHasRedirected(false);
          }
          
          // Set bidang tujuan id
          setBidangTujuanId(currentBidangId);
          
          // Handle redirects based on role with proper checks to prevent loops
          const redirectPath = getRedirectPath(currentBidangId, pathname);
          
          if (redirectPath && redirectPath !== pathname) {
            console.log(`Admin Layout: Redirecting from ${pathname} to ${redirectPath} for bidang_id ${currentBidangId}`);
            
            // Force redirect for unauthorized access regardless of hasRedirected flag
            const isUnauthorizedAccess = 
              (currentBidangId === 999 && pathname.startsWith('/admin/guest-list')) ||
              (currentBidangId === 2 && (pathname === '/admin' || pathname.startsWith('/admin/guest-management') || pathname.startsWith('/admin/survey'))) ||
              (currentBidangId && currentBidangId !== 999 && currentBidangId !== 2 && 
               (pathname === '/admin' || pathname.startsWith('/admin/guest-management') || pathname.startsWith('/admin/survey')));
            
            if (isUnauthorizedAccess || !hasRedirected) {
              setHasRedirected(true);
              
              // Immediate redirect for unauthorized access
              if (isUnauthorizedAccess) {
                console.log(`Admin Layout: UNAUTHORIZED ACCESS - Force redirecting immediately`);
                router.replace(redirectPath);
              } else {
                // Normal redirect with small delay
                setTimeout(() => {
                  router.replace(redirectPath);
                }, 50);
              }
              return; // Prevent further processing
            }
          }
          
          if (adminData.nama_lengkap) {
            // Get the first word of the full name
            const firstName = adminData.nama_lengkap.split(' ')[0];
            setAdminName(firstName);
            // Get the first letter for the initial
            setAdminInitial(firstName.charAt(0).toUpperCase());
          } else {
            // Fallback to username if no full name
            const displayName = adminData.username || 'Admin';
            setAdminName(displayName);
            setAdminInitial(displayName.charAt(0).toUpperCase());
          }
          
          if (adminData.profile_picture) {
            setAdminProfilePicture(adminData.profile_picture);
          }
          
          setIsProfileLoaded(true);
          console.log('Admin Layout: Profile loaded successfully');
          
          // Preload common admin routes after profile load
          setTimeout(() => {
            const commonRoutes = ['/admin/guest-management', '/admin/reports', '/admin/survey', '/admin/profile'];
            commonRoutes.forEach(route => {
              if (route !== pathname) {
                enhancedPrefetch(route);
              }
            });
          }, 100); // Small delay to not interfere with initial page load
        } else {
          console.log(`Admin Layout: No admin data found (attempt ${retryCount + 1})`);
          
          // Retry up to 3 times with increasing delays (for JWT cookie timing issues)
          if (retryCount < 2) {
            const delay = (retryCount + 1) * 200; // 200ms, 400ms
            console.log(`Admin Layout: Retrying in ${delay}ms...`);
            setTimeout(() => {
              fetchAdminData(retryCount + 1);
            }, delay);
            return; // Don't set loading to false yet
          } else {
            console.log('Admin Layout: Max retries reached, redirecting to login');
            // If no admin data after retries, redirect to login
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('Admin Layout: Error getting admin data:', error);
        
        // Retry on error too (might be network issue)
        if (retryCount < 2) {
          const delay = (retryCount + 1) * 200;
          console.log(`Admin Layout: Error occurred, retrying in ${delay}ms...`);
          setTimeout(() => {
            fetchAdminData(retryCount + 1);
          }, delay);
          return;
        } else {
          console.log('Admin Layout: Max retries reached after error, clearing session');
          clearAdminSessionAndRedirect(router);
        }
      } finally {
        // Only set loading to false if we're not retrying
        setIsLoadingProfile(false);
      }
    };

    // Reset profile state when pathname changes (especially coming from login)
    if (pathname !== '/admin/login') {
      // Reset states to ensure fresh fetch
      setIsProfileLoaded(false);
      setIsLoadingProfile(true);
      setHasRedirected(false); // Reset redirect flag for new navigation
      
      console.log('Admin Layout: Entering admin area, pathname:', pathname);
      
      // Always fetch admin data when entering admin area
      fetchAdminData();
    } else {
      // On login page, reset all profile states
      console.log('Admin Layout: On login page, resetting profile states');
      setAdminName('');
      setAdminInitial('');
      setAdminProfilePicture(null);
      setIsProfileLoaded(false);
      setIsLoadingProfile(false);
      setHasRedirected(false); // Reset redirect flag on login page
    }

    // Listen for profile updates (both name and picture)
    const handleProfileUpdate = (event: CustomEvent) => {
      const { profilePicture, nama_lengkap, forceRefresh } = event.detail;
      
      // If forceRefresh is true, fetch fresh admin data
      if (forceRefresh) {
        fetchAdminData();
        return;
      }
      
      // Update profile picture
      if (profilePicture !== undefined) {
        setAdminProfilePicture(profilePicture);
      }
      
      // Update name if provided
      if (nama_lengkap) {
        const firstName = nama_lengkap.split(' ')[0];
        setAdminName(firstName);
        setAdminInitial(firstName.charAt(0).toUpperCase());
      }
    };

    window.addEventListener('adminProfileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('adminProfileUpdated', handleProfileUpdate as EventListener);
    };
  }, [router, pathname]);

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Call logout API to clear JWT cookies
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        console.log('Logout successful');
      } else {
        console.error('Logout API failed, but proceeding with redirect');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Redirect to login page regardless of API response
    router.push('/admin/login');
  };

  // Function to check if menu item is active
  const isActive = (path: string) => {
    // For dashboard, only match exact path
    if (path === '/admin') {
      return pathname === '/admin';
    }
    // For other paths, check if pathname starts with the path
    return pathname.startsWith(path);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
      ),
      showForSuperAdmin: false, // Hide dashboard for kepala dinas
      showForResepsionis: true, // Show for admin resepsionis
      showForBidang: false // Hide for admin bidang
    },
    {
      name: 'Manajemen Tamu',
      path: '/admin/guest-management',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      ),
      showForSuperAdmin: false, // Hide for kepala dinas
      showForResepsionis: true, // Show for admin resepsionis
      showForBidang: false // Hide for admin bidang
    },
    {
      name: 'List Tamu',
      path: '/admin/guest-list',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
          <path d="M6 8h8v1H6V8zm0 2h8v1H6v-1z"/>
        </svg>
      ),
      showForSuperAdmin: true, // Show for kepala dinas
      showForResepsionis: false, // Hide for admin resepsionis (999)
      showForBidang: true // Show for admin bidang (selain 999)
    },
    {
      name: 'Laporan',
      path: '/admin/reports',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
        </svg>
      ),
      showForSuperAdmin: true, // Show for kepala dinas
      showForResepsionis: true, // Show for admin resepsionis
      showForBidang: true // Show for admin bidang - semua bisa akses laporan
    },
    {
      name: 'Manajemen Survei',
      path: '/admin/survey',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      ),
      showForSuperAdmin: false, // Hide for kepala dinas
      showForResepsionis: true, // Show for admin resepsionis
      showForBidang: false // Hide for admin bidang
    }
  ];

  // Filter menu items based on admin role
  const filteredMenuItems = menuItems.filter(item => {
    if (bidangTujuanId === 2) { // Kepala dinas
      return item.showForSuperAdmin;
    } else if (bidangTujuanId === 999) { // Admin Resepsionis
      return item.showForResepsionis;
    } else {
      // Admin bidang lainnya (selain 999 dan 2)
      return item.showForBidang;
    }
  });

  return (
    <AuthGuard>
      <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out overflow-hidden
        ${sidebarOpen ? 'w-56 sm:w-64' : 'w-0 md:w-12 xl:w-16'}
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo with Toggle Button */}
          <div className="flex items-center h-14 sm:h-16 px-3 sm:px-4 bg-white border-b border-gray-200 transition-all duration-300">
            <button
              type="button"
              className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className={`ml-2 sm:ml-3 text-base sm:text-lg font-semibold text-gray-800 transition-all duration-300 whitespace-nowrap ${
              sidebarOpen ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:-translate-x-2 md:w-0 overflow-hidden'
            }`}>Admin Panel</span>
          </div>
          
          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? 'mt-4 sm:mt-5 px-2' : 'mt-4 sm:mt-5 md:px-1 xl:px-2'
          }`}>
            <div className="transition-all duration-300 space-y-1 md:space-y-2">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  prefetch={true} // Enable Next.js prefetching
                  onMouseEnter={() => enhancedPrefetch(item.path)} // Enhanced prefetch on hover
                  title={!sidebarOpen ? item.name : undefined} // Tooltip for collapsed state
                  className={`
                    group flex items-center text-xs sm:text-sm font-medium transition-all duration-300 relative
                    ${sidebarOpen 
                      ? 'px-2 sm:px-3 py-2 mx-0 rounded-md' 
                      : 'py-2 px-2 sm:px-3 mx-0 rounded-md md:mx-1 xl:mx-2 md:py-2 xl:py-3 md:px-0 xl:px-0 md:justify-center md:items-center md:flex md:rounded-lg'
                    }
                    ${isActive(item.path)
                      ? sidebarOpen 
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-600' 
                        : 'md:bg-red-600 md:text-white bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {sidebarOpen ? (
                    <>
                      <span className={`flex-shrink-0 transition-all duration-300 w-4 h-4 sm:w-5 sm:h-5 ${
                        isActive(item.path) ? 'text-red-500' : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {item.icon}
                      </span>
                      <span className={`ml-2 sm:ml-3 transition-all duration-300 truncate whitespace-nowrap ${
                        sidebarOpen ? 'opacity-100 translate-x-0 w-auto' : 'md:opacity-0 md:-translate-x-2 md:w-0 overflow-hidden'
                      }`}>
                        {item.name}
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Mobile view - same as expanded */}
                      <span className={`flex-shrink-0 transition-all duration-300 w-4 h-4 sm:w-5 sm:h-5 md:hidden ${
                        isActive(item.path) ? 'text-red-500' : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {item.icon}
                      </span>
                      <span className={`ml-2 sm:ml-3 transition-all duration-300 truncate whitespace-nowrap md:hidden ${
                        sidebarOpen ? 'opacity-100 translate-x-0 w-auto' : 'md:opacity-0 md:-translate-x-2 md:w-0 overflow-hidden'
                      }`}>
                        {item.name}
                      </span>
                      
                      {/* Desktop collapsed view - perfectly centered icon */}
                      <div className="hidden md:flex md:w-full md:h-full md:items-center md:justify-center">
                        <span className={`transition-all duration-300 w-4 h-4 sm:w-5 sm:h-5 ${
                          isActive(item.path) ? 'text-white' : 'text-gray-700 group-hover:text-gray-800'
                        }`}>
                          {item.icon}
                        </span>
                      </div>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Logout */}
          <div className={`p-3 sm:p-4 border-t border-gray-200 ${!sidebarOpen ? 'md:px-1 xl:px-2' : ''}`}>
            <button
              onClick={handleLogout}
              title={!sidebarOpen ? 'Logout' : undefined} // Tooltip for collapsed state
              className={`flex items-center text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200 w-full text-left ${
                sidebarOpen ? 'px-2 sm:px-3 py-2' : 'px-2 sm:px-3 py-2 md:justify-center'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className={`ml-2 sm:ml-3 transition-all duration-300 whitespace-nowrap ${
                sidebarOpen ? 'opacity-100 translate-x-0 w-auto' : 'md:opacity-0 md:-translate-x-2 md:w-0 overflow-hidden'
              }`}>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Top header */}
        <div className="flex-shrink-0 flex h-14 sm:h-16 bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex-1 px-3 sm:px-4 flex justify-end items-center min-w-0">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
              

              {/* User Profile */}
              <Link 
                href="/admin/profile" 
                prefetch={true} // Enable Next.js prefetching
                className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2 transition-colors duration-200 group"
                onMouseEnter={() => enhancedPrefetch('/admin/profile')} // Enhanced prefetch on hover
              >
                {isLoadingProfile ? (
                  // Loading state
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 animate-pulse flex items-center justify-center ring-2 ring-gray-100">
                    <span className="text-xs sm:text-sm font-medium text-gray-500">...</span>
                  </div>
                ) : adminProfilePicture ? (
                  <img
                    src={adminProfilePicture}
                    alt="Profile"
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-red-100 group-hover:ring-red-200 transition-all duration-200"
                  />
                ) : (
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-red-600 flex items-center justify-center ring-2 ring-red-100 group-hover:ring-red-200 transition-all duration-200">
                    <span className="text-xs sm:text-sm font-medium text-white">{adminInitial || 'A'}</span>
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:block group-hover:text-gray-900">
                  {isLoadingProfile ? 'Loading...' : (adminName || 'Admin')}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          <SectionErrorBoundary>
            <div className="h-full overflow-y-auto">
              {children}
            </div>
          </SectionErrorBoundary>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
