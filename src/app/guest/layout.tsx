'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Script from 'next/script';
import React from 'react';

import { SectionErrorBoundary } from '../../components/error/ErrorBoundary';

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

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false); // Keep default false for mobile
  const pathname = usePathname();
  const router = useRouter();

  // Set initial sidebar state based on screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      setSidebarOpen(isDesktop);
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      // Auto-adjust sidebar based on screen size
      if (isDesktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const currentIndex = ['/guest/register', '/guest/status', '/guest/survey'].indexOf(pathname);
      
      // Add likely next routes based on current location
      if (currentIndex !== -1) {
        const nextRoutes = ['/guest/register', '/guest/status', '/guest/survey'];
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

  // Skip layout for the main guest landing pages to make it full screen
  if (pathname === '/guest' || pathname === '/guest/landing') {
    return (
      <>
        <Script 
          src="https://cdn.userway.org/widget.js" 
          data-account="3DtJJGdGnQ"
          strategy="afterInteractive"
        />
        {children}
      </>
    );
  }

  // Function to check if menu item is active
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  // Handle navigation click - close sidebar on mobile
  const handleNavClick = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    {
      name: 'Pendaftaran Tamu',
      path: '/guest/register',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      name: 'Status Pengajuan',
      path: '/guest/status',
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/1827/1827349.png"
          alt="Status Pengajuan"
          className="w-4.5 h-4.5"
          style={{ filter: isActive('/guest/status') ? 'invert(34%) sepia(98%) saturate(749%) hue-rotate(100deg) brightness(95%) contrast(92%)' : 'none' }}
        />
      )
    },
    {
      name: 'Survei',
      path: '/guest/survey',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      )
    }
  ];

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Script 
        src="https://cdn.userway.org/widget.js" 
        data-account="3DtJJGdGnQ"
        strategy="afterInteractive"
      />
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out overflow-hidden
        md:relative md:translate-x-0 md:z-auto md:bg-white
        ${sidebarOpen ? 'translate-x-0 w-64 md:bg-white bg-white/95 backdrop-blur-sm' : '-translate-x-full w-64 md:translate-x-0 md:w-16'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo with Toggle Button */}
          <div className="flex items-center h-16 px-4 bg-white border-b border-gray-200 transition-all duration-300">
            <button
              type="button"
              className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className={`ml-3 text-lg font-semibold text-gray-800 transition-all duration-300 whitespace-nowrap ${
              sidebarOpen ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:-translate-x-2 md:w-0 overflow-hidden'
            }`}>Portal Tamu</span>
          </div>
          
          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? 'mt-5 px-2' : 'md:mt-8 md:px-1'
          }`}>
            <div className="transition-all duration-300 space-y-1 md:space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  prefetch={true} // Enable Next.js prefetching
                  onMouseEnter={() => enhancedPrefetch(item.path)} // Enhanced prefetch on hover
                  onClick={handleNavClick} // Auto-close sidebar on mobile
                  title={!sidebarOpen ? item.name : undefined} // Tooltip for collapsed state
                  className={`
                    group flex items-center text-sm font-medium transition-all duration-300 relative
                    ${sidebarOpen 
                      ? 'px-3 py-2 mx-0 rounded-md' 
                      : 'py-2 px-3 mx-0 rounded-md md:mx-2 md:py-3 md:px-0 md:justify-center md:items-center md:flex md:rounded-lg'
                    }
                    ${isActive(item.path)
                      ? sidebarOpen 
                        ? 'bg-green-50 text-green-700 border-r-2 border-green-600' 
                        : 'md:bg-green-600 md:text-white bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {sidebarOpen ? (
                    <>
                      <span className={`flex-shrink-0 transition-all duration-300 w-5 h-5 ${
                        isActive(item.path) ? 'text-green-500' : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="ml-3 transition-all duration-300 truncate whitespace-nowrap">
                        {item.name}
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Mobile view - same as expanded */}
                      <span className={`flex-shrink-0 transition-all duration-300 w-5 h-5 md:hidden ${
                        isActive(item.path) ? 'text-green-500' : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="ml-3 transition-all duration-300 truncate whitespace-nowrap md:hidden">
                        {item.name}
                      </span>
                      
                      {/* Desktop collapsed view - perfectly centered icon */}
                      <div className="hidden md:flex md:w-full md:h-full md:items-center md:justify-center">
                        <span className={`transition-all duration-300 w-5 h-5 ${
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
          
        </div>
      </div>

      {/* Invisible click area to close sidebar on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 md:hidden bg-transparent" 
          onClick={() => setSidebarOpen(false)}
          style={{ left: '256px' }} // Start after sidebar width
        />
      )}

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
        sidebarOpen ? 'md:ml-0' : 'md:ml-0'
      }`}>
        {/* Top header */}
        <div className="flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200 z-10">
          {/* Mobile menu button */}
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {pathname.includes('/register') && 'Pendaftaran Tamu'}
              {pathname.includes('/status') && 'Status Pengajuan'}
              {pathname.includes('/survey') && 'Survei'}
            </h1>
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Notifications */}
              
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <SectionErrorBoundary>
            {children}
          </SectionErrorBoundary>
        </main>
      </div>
    </div>
  );
}
