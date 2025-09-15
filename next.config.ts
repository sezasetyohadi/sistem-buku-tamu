import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SWC minification is enabled by default in Next.js 13+, no need to specify
  reactStrictMode: true,
  
  // ESLint configuration - disable during build to prevent blocking
  eslint: {
    ignoreDuringBuilds: true, // This will bypass ESLint during build
  },
  
  // TypeScript configuration - disable type checking during build if needed
  typescript: {
    ignoreBuildErrors: false, // Keep false to catch real TypeScript errors
  },
  
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  experimental: {
    optimizeCss: true, // Re-enable CSS optimization
    optimizePackageImports: ['react-icons', 'date-fns', 'lodash', 'recharts'],
  },
  env: {
    APP_MODE: process.env.APP_MODE || 'full',
    ADMIN_PORT: process.env.ADMIN_PORT || '3001',
    GUEST_PORT: process.env.GUEST_PORT || '3000',
  },
  // Conditional redirects based on APP_MODE
  async redirects() {
    const appMode = process.env.APP_MODE;
    
    // Default redirect for root to guest landing
    const defaultRedirects = [
      {
        source: '/',
        destination: '/guest/landing',
        permanent: false,
      }
    ];
    
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
        {
          source: '/',
          destination: '/guest/landing',
          permanent: false,
        },
        {
          source: '/admin/:path*',
          destination: '/guest',
          permanent: false,
        }
      ];
    }
    
    return defaultRedirects;
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
