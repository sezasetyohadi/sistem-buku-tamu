"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "../../components/auth/AuthGuard";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = React.useState<string>('Admin');
  const [adminInitial, setAdminInitial] = React.useState<string>('A');

  React.useEffect(() => {
    // Get admin session data when component mounts
    const getAdminData = () => {
      try {
        const adminSessionStr = localStorage.getItem('admin_session');
        if (adminSessionStr) {
          const adminSession = JSON.parse(adminSessionStr);
          if (adminSession.nama_lengkap) {
            // Get the first word of the full name
            const firstName = adminSession.nama_lengkap.split(' ')[0];
            setAdminName(firstName);
            // Get the first letter for the initial
            setAdminInitial(firstName.charAt(0).toUpperCase());
          }
        }
      } catch (error) {
        console.error('Error getting admin data:', error);
      }
    };
    
    getAdminData();
  }, []);

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Function to handle logout
  const handleLogout = () => {
    // Clear localStorage and cookies
    localStorage.removeItem('admin_session');
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Redirect to login page
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
      )
    },
    {
      name: 'Daftar Tamu',
      path: '/admin/guest-management',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      name: 'Laporan',
      path: '/admin/reports',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      name: 'Survey',
      path: '/admin/survey',
      icon: (
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      )
    }
  ];

  return (
    <AuthGuard>
      <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'}
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo with Toggle Button */}
          <div className={`flex items-center h-16 px-4 bg-white border-b border-gray-200 transition-all duration-300 ${
            sidebarOpen ? '' : 'md:px-2'
          }`}>
            <button
              type="button"
              className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className={`ml-3 text-lg font-semibold text-gray-800 transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:w-0 overflow-hidden'
            }`}>Admin Panel</span>
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
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={`flex-shrink-0 transition-all duration-300 ${
                    isActive(item.path) ? 'text-red-500' : 'text-gray-700 group-hover:text-gray-800'
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
          
          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200 w-full text-left"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && "Logout"}
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top header */}
        <div className="flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex-1 px-4 flex justify-end items-center min-w-0">
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Notifications */}
              <button className="p-2 rounded-full text-gray-700 hover:text-gray-800 hover:bg-gray-100 relative transition-colors duration-200">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4V5.08C16.39 5.57 18 7.54 18 10V16L20 18V19H4V18L6 16V10C6 7.54 7.61 5.57 10 5.08V4C10 2.9 10.9 2 12 2ZM10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21Z"/>
                </svg>
              </button>

              {/* User Profile */}
              <Link href="/admin/profile" className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 group">
                <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center ring-2 ring-red-100 group-hover:ring-red-200 transition-all duration-200">
                  <span className="text-sm font-medium text-white">{adminInitial}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-gray-900">{adminName}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
