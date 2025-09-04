import jwt from 'jsonwebtoken';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET; // Use a strong secret in production
const JWT_EXPIRES_IN = '24h';
const JWT_REFRESH_EXPIRES_IN = '7d';

// User types
export type UserType = 'admin' | 'guest';

// JWT Payload interfaces
export interface AdminJWTPayload {
  userId: number;
  username: string;
  email: string;
  nama_lengkap: string;
  is_super_admin: boolean;
  userType: 'admin';
  iat?: number;
  exp?: number;
}

export interface GuestJWTPayload {
  guestId: number;
  nama_lengkap: string;
  email: string;
  nomor_telp: string;
  userType: 'guest';
  iat?: number;
  exp?: number;
}

export type JWTPayload = AdminJWTPayload | GuestJWTPayload;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh token pair for admin
 */
export function generateAdminTokens(payload: Omit<AdminJWTPayload, 'iat' | 'exp' | 'userType'>): TokenPair {
  const adminPayload = { ...payload, userType: 'admin' as const };
  
  const accessToken = jwt.sign(adminPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sistem-buku-tamu',
    audience: 'admin-panel'
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId, username: payload.username, userType: 'admin' },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'sistem-buku-tamu',
      audience: 'admin-panel'
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Generate access and refresh token pair for guest
 */
export function generateGuestTokens(payload: Omit<GuestJWTPayload, 'iat' | 'exp' | 'userType'>): TokenPair {
  const guestPayload = { ...payload, userType: 'guest' as const };
  
  const accessToken = jwt.sign(guestPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sistem-buku-tamu',
    audience: 'guest-portal'
  });

  const refreshToken = jwt.sign(
    { guestId: payload.guestId, userType: 'guest' },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'sistem-buku-tamu',
      audience: 'guest-portal'
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string, audience: 'admin-panel' | 'guest-portal'): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sistem-buku-tamu',
      audience: audience
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify admin refresh token
 */
export function verifyAdminRefreshToken(token: string): { userId: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sistem-buku-tamu',
      audience: 'admin-panel'
    }) as { userId: number; username: string; userType: string };
    
    if (decoded.userType !== 'admin') return null;
    
    return { userId: decoded.userId, username: decoded.username };
  } catch (error) {
    console.error('Admin refresh token verification failed:', error);
    return null;
  }
}

/**
 * Verify guest refresh token
 */
export function verifyGuestRefreshToken(token: string): { guestId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sistem-buku-tamu',
      audience: 'guest-portal'
    }) as { guestId: number; userType: string };
    
    if (decoded.userType !== 'guest') return null;
    
    return { guestId: decoded.guestId };
  } catch (error) {
    console.error('Guest refresh token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Get remaining token time in seconds
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) return null;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is admin from JWT payload
 */
export function isAdminUser(payload: JWTPayload): payload is AdminJWTPayload {
  return payload.userType === 'admin';
}

/**
 * Check if user is guest from JWT payload
 */
export function isGuestUser(payload: JWTPayload): payload is GuestJWTPayload {
  return payload.userType === 'guest';
}
