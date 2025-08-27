import { executeQuery } from '../config/db';
import crypto from 'crypto';

// Interface for token data
export interface TokenData {
  id?: number;
  tamu_id: number;
  token: string;
  is_active: boolean;
  created_at?: Date;
}

// Function to generate a random token
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Function to create a new token
export async function createToken(tamuId: number): Promise<TokenData> {
  try {
    // Generate a random token
    const token = generateToken();
    
    // Insert token into database
    const result = await executeQuery<any>(
      `INSERT INTO tamu_token (tamu_id, token, is_active) 
       VALUES (?, ?, 1)`,
      [tamuId, token]
    );
    
    // Return token data
    const tokenData: TokenData = {
      id: result.insertId,
      tamu_id: tamuId,
      token: token,
      is_active: true,
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
      `SELECT * FROM tamu_token WHERE token = ? AND is_active = 1`,
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

// Function to deactivate a token
export async function deactivateToken(tokenId: number): Promise<boolean> {
  try {
    // Mark token as inactive
    await executeQuery(
      `UPDATE tamu_token SET is_active = 0 WHERE id = ?`,
      [tokenId]
    );
    
    return true;
  } catch (error) {
    console.error('Error deactivating token:', error);
    throw error;
  }
}

// Function to get token status by token string
export async function getTokenStatus(token: string): Promise<{ tamuId: number; status: string; details?: any } | null> {
  try {
    // Get token info
    const tokenData = await verifyToken(token);
    
    if (!tokenData) {
      return null;
    }
    
    // Get guest booking status
    const guestData = await executeQuery<any[]>(
      `SELECT 
        dt.id, 
        dt.nama, 
        dt.nomor_telp,
        dt.email,
        dt.keperluan,
        dt.jadwal_checkin,
        dt.waktu_checkin,
        dt.waktu_checkout,
        dt.status_kunjungan,
        b.bidang 
      FROM daftar_tamu dt 
      LEFT JOIN bidang_tujuan b ON dt.bidang_tujuan_id = b.id
      WHERE dt.id = ?`,
      [tokenData.tamu_id]
    );
    
    if (!guestData || guestData.length === 0) {
      return {
        tamuId: tokenData.tamu_id,
        status: 'not_found',
      };
    }
    
    const guest = guestData[0];
    let status = 'registered'; // default status

    if (guest.waktu_checkout) {
      status = 'completed';
    } else if (guest.waktu_checkin) {
      status = 'checked_in';
    } else if (guest.jadwal_checkin) {
      status = 'scheduled';
    }

    return {
      tamuId: tokenData.tamu_id,
      status: status,
      details: guest
    };
  } catch (error) {
    console.error('Error getting token status:', error);
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

// Function to clean up inactive tokens older than X days
export async function cleanupOldTokens(daysOld: number = 30): Promise<number> {
  try {
    const result = await executeQuery<any>(
      `DELETE FROM tamu_token WHERE is_active = 0 AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysOld]
    );
    
    return result.affectedRows || 0;
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    throw error;
  }
}
