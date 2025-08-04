"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: '🏠 Beranda', href: '/' },
    { name: '📝 Daftar Tamu', href: '/register' },
    { name: '🙏 Permohonan Layanan', href: '/guests' },
    { name: '⭐ Survei Kepuasan', href: '/survey' },
  ];

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      <div className="absolute top-0 left-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg border border-white/30">
              <span className="text-3xl">🏢</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Sistem Layanan Tamu
              </h1>
              <span className="text-sm text-white/80 font-medium">Digital Guest Management System</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      pathname === item.href
                        ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/30'
                        : 'text-white/90 hover:bg-white/15 hover:text-white hover:shadow-md'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-white/20 backdrop-blur-sm">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    pathname === item.href
                      ? 'bg-white/25 text-white shadow-lg'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}