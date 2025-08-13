"use client";
import React from "react";
import { usePathname } from "next/navigation";

interface GuestClientLayoutProps {
  children: React.ReactNode;
  className: string;
}

export default function GuestClientLayout({ children, className }: GuestClientLayoutProps) {
  const pathname = usePathname();

  return (
    <body className={className}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        {/* Guest Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo Section */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">SIM Buku Tamu</h1>
                  <p className="text-xs text-gray-600">DISNAKERTRANS Jawa Tengah</p>
                </div>
              </div>

              {/* Navigation for Guest */}
              <nav className="hidden md:flex items-center space-x-6">
                <a 
                  href="/guest" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/guest' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Beranda
                </a>
                <a 
                  href="/guest/register" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/guest/register' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Pendaftaran
                </a>
                <a 
                  href="/guest/survey" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/guest/survey' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Survey
                </a>
              </nav>

              {/* Admin Login Link */}
              <div className="flex items-center">
                <a 
                  href="/admin" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Login Admin
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Guest Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img 
                  src="/logo-jateng.svg" 
                  alt="Logo Jawa Tengah" 
                  className="w-8 h-8"
                />
                <span className="text-lg font-bold text-gray-800">DISNAKERTRANS Jawa Tengah</span>
              </div>
              <p className="text-gray-600 text-sm">
                Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah
              </p>
              <p className="text-gray-500 text-xs mt-2">
                © 2025 DISNAKERTRANS Jawa Tengah. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </body>
  );
}
