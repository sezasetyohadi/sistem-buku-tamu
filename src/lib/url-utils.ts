/**
 * Utility untuk mendapatkan base URL aplikasi
 * Mendukung berbagai environment: development, production, dan deployment
 */

/**
 * Mendapatkan base URL dari environment variables atau request headers
 * @param request - NextRequest object (optional untuk server-side)
 * @returns Base URL yang sesuai dengan environment
 */
export function getBaseUrl(request?: Request): string {
  // 1. Prioritas pertama: NEXT_PUBLIC_BASE_URL untuk deployment
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL !== 'http://localhost:3001') {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // 2. Jika ada request, coba ambil dari headers untuk auto-detection
  if (request) {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 
                    request.headers.get('x-forwarded-protocol') || 
                    (request.url.startsWith('https') ? 'https' : 'http');
    
    if (host) {
      // Untuk production deployment
      if (host.includes('vercel.app') || 
          host.includes('netlify.app') || 
          host.includes('herokuapp.com') ||
          !host.includes('localhost')) {
        return `${protocol}://${host}`;
      }
    }
  }
  
  // 3. Fallback ke NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // 4. Default fallback untuk development
  return 'http://localhost:3001';
}

/**
 * Mendapatkan URL lengkap dengan path
 * @param path - Path yang akan ditambahkan ke base URL
 * @param request - NextRequest object (optional)
 * @returns URL lengkap
 */
export function getFullUrl(path: string, request?: Request): string {
  const baseUrl = getBaseUrl(request);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Mendapatkan base URL untuk mode tertentu (guest/admin)
 * @param mode - 'guest' atau 'admin'
 * @param request - NextRequest object (optional)
 * @returns Base URL untuk mode yang diminta
 */
export function getModeBaseUrl(mode: 'guest' | 'admin', request?: Request): string {
  // Jika ada request dan bisa detect dari host
  if (request) {
    const detectedUrl = getBaseUrl(request);
    if (detectedUrl !== 'http://localhost:3001' && detectedUrl !== 'http://localhost:3000') {
      return detectedUrl; // Untuk production, gunakan URL yang sama
    }
  }
  
  // Untuk development, gunakan port yang berbeda
  if (mode === 'guest') {
    return process.env.NEXT_PUBLIC_GUEST_URL || 'http://localhost:3000';
  } else {
    return process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
  }
}

/**
 * Check apakah sedang di environment production
 * @returns boolean
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check apakah sedang di environment development
 * @returns boolean
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}