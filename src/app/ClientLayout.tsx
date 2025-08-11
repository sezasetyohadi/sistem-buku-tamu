"use client";
import React from "react";
import { usePathname } from "next/navigation";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const pathname = usePathname();

  // Function to check if menu item is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname === path) return true;
    return false;
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
      )
    }
  ];

  const guestMenuItems = [
    {
      name: 'Pendaftaran Tamu',
      path: '/guests/register',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      name: 'Daftar Tamu',
      path: '/guests',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      name: 'Survey',
      path: '/guests/survey',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      )
    }
  ];

  const adminMenuItems = [
    {
      name: 'Laporan',
      path: '/admin',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      )
    }
  ];

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'}
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo */}
          <div className={`flex items-center h-16 px-4 bg-white border-b border-gray-200 transition-all duration-300 ${
            sidebarOpen ? '' : 'md:px-2'
          }`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </div>
            <span className={`ml-3 text-lg font-semibold text-gray-800 transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0 overflow-hidden'
            }`}>SIM Buku Tamu</span>
          </div>
          
          {/* Navigation */}
          <nav className="mt-5 px-2 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300
                      ${sidebarOpen ? '' : 'md:justify-center md:px-2'}
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className={`mr-3 ${isActive(item.path) ? 'text-blue-500' : 'text-gray-700 group-hover:text-gray-800'}`}>
                      {item.icon}
                    </span>
                    <span className={`transition-opacity duration-300 ${
                      sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0 overflow-hidden'
                    }`}>
                      {item.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Guest Management Section */}
              <div className="space-y-1">
                <div className={`px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                  sidebarOpen ? 'block' : 'md:hidden'
                }`}>
                  Manajemen Tamu
                </div>
                {guestMenuItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300
                      ${sidebarOpen ? '' : 'md:justify-center md:px-2'}
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className={`mr-3 ${isActive(item.path) ? 'text-blue-500' : 'text-gray-700 group-hover:text-gray-800'}`}>
                      {item.icon}
                    </span>
                    <span className={`transition-opacity duration-300 ${
                      sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0 overflow-hidden'
                    }`}>
                      {item.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Admin Section */}
              <div className="space-y-1">
                <div className={`px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                  sidebarOpen ? 'block' : 'md:hidden'
                }`}>
                  Admin
                </div>
                {adminMenuItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300
                      ${sidebarOpen ? '' : 'md:justify-center md:px-2'}
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className={`mr-3 ${isActive(item.path) ? 'text-blue-500' : 'text-gray-700 group-hover:text-gray-800'}`}>
                      {item.icon}
                    </span>
                    <span className={`transition-opacity duration-300 ${
                      sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0 overflow-hidden'
                    }`}>
                      {item.name}
                    </span>
                  </a>
                ))}
              </div>
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
            className="md:hidden px-4 border-r border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h16" />
            </svg>
          </button>

          {/* Desktop toggle button */}
          <button
            type="button"
            className="hidden md:flex px-4 border-r border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h16" />
            </svg>
          </button>

          {/* Header content */}
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 truncate">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-100">
                  <span className="text-sm font-medium text-white">U</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}