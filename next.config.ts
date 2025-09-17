import type { NextConfig } from "next";

const appMode = process.env.APP_MODE || process.env.NEXT_PUBLIC_APP_MODE || 'full';

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
    APP_MODE: appMode,
    ADMIN_PORT: process.env.ADMIN_PORT || '3001',
    GUEST_PORT: process.env.GUEST_PORT || '3000',
    CUSTOM_KEY: 'value'
  },
  
  // Public runtime config
  publicRuntimeConfig: {
    appMode: appMode,
  },
  
  // Conditional redirects based on environment and domain
  async redirects() {
    const redirects = [];
    
    console.log('Next.js config - APP_MODE:', appMode);
    
    if (appMode === 'admin') {
      // Admin deployment redirects
      redirects.push(
        {
          source: '/',
          destination: '/admin',
          permanent: false,
        },
        {
          source: '/guest/:path*',
          destination: '/access-denied',
          permanent: false,
        },
        {
          source: '/register',
          destination: '/access-denied',
          permanent: false,
        },
        {
          source: '/visit',
          destination: '/access-denied',
          permanent: false,
        }
      );
    } else if (appMode === 'guest') {
      // Guest deployment redirects
      redirects.push(
        {
          source: '/',
          destination: '/guest',
          permanent: false,
        },
        {
          source: '/admin/:path*',
          destination: '/access-denied',
          permanent: false,
        }
      );
    } else {
      // Full mode - redirect root to guest landing by default
      redirects.push({
        source: '/',
        destination: '/guest/landing',
        permanent: false,
      });
    }
    
    return redirects;
  },
  
  // Conditional rewrites for domain-based routing
  async rewrites() {
    const rewrites = [];
    
    // Mode-specific API blocking
    if (appMode === 'admin') {
      // Block guest-specific API routes in admin deployment
      rewrites.push({
        source: '/api/guest/:path*',
        destination: '/api/not-found',
      });
    } else if (appMode === 'guest') {
      // Block admin-specific API routes in guest deployment
      rewrites.push({
        source: '/api/admin/:path*',
        destination: '/api/not-found',
      });
    }
    
    return rewrites;
  }
};

export default nextConfig;
