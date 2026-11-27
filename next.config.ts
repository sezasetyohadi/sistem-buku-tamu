import type { NextConfig } from "next";

const appMode = process.env.APP_MODE || process.env.NEXT_PUBLIC_APP_MODE || 'full';

//console.log('Next.js Config - Building with APP_MODE:', appMode);

const nextConfig: NextConfig = {
  // SWC minification is enabled by default in Next.js 13+, no need to specify
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
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
  
  // Headers for security and mode identification
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-App-Mode',
            value: appMode,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // Conditional redirects based on environment and domain
  async redirects() {
    const redirects = [];
    
    //console.log('Next.js config redirects - APP_MODE:', appMode);
    
    if (appMode === 'admin') {
      // Admin deployment redirects
      //console.log('Setting up admin redirects');
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
      //console.log('Setting up guest redirects');
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
      //console.log('Setting up full mode redirects');
      redirects.push({
        source: '/',
        destination: '/guest/landing',
        permanent: false,
      });
    }
    
    //console.log('Generated redirects:', redirects);
    return redirects;
  },
  
  // Conditional rewrites for API routing
  async rewrites() {
    const rewrites = [];
    
    // Mode-specific API blocking
    if (appMode === 'admin') {
      //console.log('Setting up admin API rewrites - blocking guest APIs');
      // Block guest-specific API routes in admin deployment
      rewrites.push({
        source: '/api/guest/:path*',
        destination: '/api/not-found',
      });
    } else if (appMode === 'guest') {
      //console.log('Setting up guest API rewrites - blocking admin APIs');
      // Block admin-specific API routes in guest deployment
      rewrites.push({
        source: '/api/admin/:path*',
        destination: '/api/not-found',
      });
    }
    
    //console.log('Generated rewrites:', rewrites);
    return rewrites;
  }
};

export default nextConfig;
