import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    APP_MODE: process.env.APP_MODE || 'full',
    ADMIN_PORT: process.env.ADMIN_PORT || '3001',
    GUEST_PORT: process.env.GUEST_PORT || '3000',
  },
  // Conditional redirects based on APP_MODE
  async redirects() {
    const appMode = process.env.APP_MODE;
    
    if (appMode === 'admin') {
      return [
        {
          source: '/',
          destination: '/admin',
          permanent: false,
        },
        {
          source: '/guest/:path*',
          destination: '/admin',
          permanent: false,
        }
      ];
    }
    
    if (appMode === 'guest') {
      return [
        // Remove the root redirect so landing page can be accessed
        // {
        //   source: '/',
        //   destination: '/guest',
        //   permanent: false,
        // },
        {
          source: '/admin/:path*',
          destination: '/guest',
          permanent: false,
        }
      ];
    }
    
    return [];
  },
  // Conditional rewrites for API routes
  async rewrites() {
    const appMode = process.env.APP_MODE;
    
    if (appMode === 'admin') {
      return [
        {
          source: '/api/guest/:path*',
          destination: '/api/not-found',
        }
      ];
    }
    
    if (appMode === 'guest') {
      return [
        {
          source: '/api/admin/:path*',
          destination: '/api/not-found',
        }
      ];
    }
    
    return [];
  }
};

export default nextConfig;
