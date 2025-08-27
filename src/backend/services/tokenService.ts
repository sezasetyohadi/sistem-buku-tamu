import { executeQuery } from '../config/db';
import crypto from 'crypto';

// Interface for token data
export interface TokenData {
  id?: number;
  tamu_id: number;
  token: string;
  tipe: 'verifikasi' | 'reset';
  expires_at: Date;
  created_at?: Date;
}

// Function to generate a random token
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Function to create a new token
export async function createToken(tamuId: number, tipe: 'verifikasi' | 'reset' = 'verifikasi', expiryHours: number = 24): Promise<TokenData> {
  try {
    // Generate a random token
    const token = generateToken();
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);
    
    // Insert token into database
    const result = await executeQuery<any>(
      `INSERT INTO tamu_token (tamu_id, token, tipe, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [tamuId, token, tipe, expiresAt]
    );
    
    // Return token data
    const tokenData: TokenData = {
      id: result.insertId,
      tamu_id: tamuId,
      token: token,
      tipe: tipe,
      expires_at: expiresAt,
      created_at: new Date()
    };
    
    return tokenData;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

// Function to verify a token
export async function verifyToken(token: string): Promise<TokenData | null> {
  try {
    // Find token in database
    const tokens = await executeQuery<TokenData[]>(
      `SELECT * FROM tamu_token WHERE token = ? AND expires_at > NOW()`,
      [token]
    );
    
    if (tokens && tokens.length > 0) {
      return tokens[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

// Function to invalidate a token (mark as used or delete)
export async function invalidateToken(tokenId: number): Promise<boolean> {
  try {
    // Delete the token as it's been used
    await executeQuery(
      `DELETE FROM tamu_token WHERE id = ?`,
      [tokenId]
    );
    
    return true;
  } catch (error) {
    console.error('Error invalidating token:', error);
    throw error;
  }
}

// Function to get tokens for a guest
export async function getTokensByTamuId(tamuId: number): Promise<TokenData[]> {
  try {
    const tokens = await executeQuery<TokenData[]>(
      `SELECT * FROM tamu_token WHERE tamu_id = ? ORDER BY created_at DESC`,
      [tamuId]
    );
    
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
}

// Function to clean up expired tokens
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await executeQuery<any>(
      `DELETE FROM tamu_token WHERE expires_at < NOW()`
    );
    
    return result.affectedRows || 0;
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    throw error;
  }
}
