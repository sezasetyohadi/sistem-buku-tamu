"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SectionErrorBoundary } from "../../components/error/ErrorBoundary";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true); // Keep default true for desktop
  const pathname = usePathname();

  // Skip layout for the main guest landing pages to make it full screen
  if (pathname === '/guest' || pathname === '/guest/landing') {
    return <>{children}</>;
  }

  // Function to check if menu item is active
  const isActive = (path: string) => {
    return pathname.startsWith(path);
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
      name: 'Survey',
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
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-16'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo with Toggle Button */}
          <div className={`flex items-center h-16 px-4 bg-white border-b border-gray-200 transition-all duration-300 ${
            sidebarOpen ? '' : 'md:px-2'
          }`}>
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
            <span className={`ml-3 text-lg font-semibold text-gray-800 transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0 overflow-hidden'
            }`}>Portal Tamu</span>
          </div>
          
          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? 'mt-5 px-2' : 'md:mt-8 md:px-0'
          }`}>
            <div className={`transition-all duration-300 ${
              sidebarOpen ? 'space-y-1' : 'md:space-y-3'
            }`}>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    group flex items-center text-sm font-medium transition-all duration-300
                    ${sidebarOpen 
                      ? 'px-3 py-2 mx-0 rounded-md' 
                      : 'md:px-0 md:py-3 md:mx-2 md:justify-center md:rounded-lg py-2 px-3 mx-0 rounded-md'
                    }
                    ${isActive(item.path)
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-800'
                    }
                  `}
                >
                  <span className={`flex-shrink-0 transition-all duration-300 ${
                    isActive(item.path) ? 'text-green-500' : 'text-gray-700 group-hover:text-gray-800'
                  } ${
                    sidebarOpen ? 'w-5 h-5' : 'md:w-5 md:h-5 w-5 h-5'
                  }`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span className="ml-3 transition-opacity duration-300">
                      {item.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
          
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
      <div className="flex-1 flex flex-col min-h-0">
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
              {pathname.includes('/survey') && 'Survey'}
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
