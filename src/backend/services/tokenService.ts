import crypto from 'crypto';

import { executeQuery } from '../config/db';
import { getIndonesiaTime } from '../../lib/timezone-utils';

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
    
    // Use consistent Indonesia timezone for created_at
    const createdAt = getIndonesiaTime();
    
    // Insert token into database with explicit created_at
    const result = await executeQuery<any>(
      `INSERT INTO tamu_token (tamu_id, token, is_active, created_at) 
       VALUES (?, ?, 1, ?)`,
      [tamuId, token, createdAt]
    );
    
    // Return token data with consistent Indonesia timezone
    const tokenCreatedAt = getIndonesiaTime();
    const tokenData: TokenData = {
      id: result.insertId,
      tamu_id: tamuId,
      token: token,
      is_active: true,
      created_at: tokenCreatedAt
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
      'SELECT * FROM tamu_token WHERE token = ? AND is_active = 1',
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
      'UPDATE tamu_token SET is_active = 0 WHERE id = ?',
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
    
    // Get guest booking status with education, profession, and bidang tujuan data
    const guestData = await executeQuery<any[]>(
      `SELECT 
        dt.id, 
        dt.nama, 
        dt.nomor_telp,
        dt.email,
        dt.alamat,
        dt.jenis_kelamin,
        pt.pendidikan_terakhir,
        p.nama_profesi as profesi,
        dt.asal_instansi,
        dt.keperluan,
        dt.jadwal_checkin,
        dt.waktu_checkin,
        dt.waktu_checkout,
        dt.waktu_dibuat,
        dt.jadwal_dibuat,
        dt.file_upload,
        dt.status_kunjungan,
        dt.catatan_tambahan,
        dt.bidang_tujuan_id,
        bt.bidang as bidang_tujuan,
        dt.asn_dituju
      FROM daftar_tamu dt 
      LEFT JOIN profesi p ON dt.profesi_id = p.id
      LEFT JOIN pendidikan_terakhir pt ON dt.pendidikan_terakhir_id = pt.id
      LEFT JOIN bidang_tujuan bt ON dt.bidang_tujuan_id = bt.id
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

    // Get cara memperoleh informasi selections
    let caraMendapatkanInformasi: string[] = [];
    try {
      const informasiQuery = `
        SELECT m.nama_opsi 
        FROM jawaban_memperoleh_informasi j
        JOIN memperoleh_informasi m ON j.cara_memperoleh_id = m.id
        WHERE j.tamu_id = ?
      `;
      const informasiResult = await executeQuery<Array<{ nama_opsi: string }>>(informasiQuery, [tokenData.tamu_id]);
      caraMendapatkanInformasi = informasiResult.map(item => item.nama_opsi);
    } catch (error) {
      console.error('Error fetching memperoleh informasi data:', error);
    }

    // Get cara mendapatkan salinan selections
    let caraSalinan: string[] = [];
    let caraSalinanIds: number[] = [];
    try {
      const salinanQuery = `
        SELECT m.id, m.nama_opsi 
        FROM jawaban_mendapatkan_salinan j
        JOIN mendapatkan_salinan m ON j.cara_salinan_id = m.id
        WHERE j.tamu_id = ?
      `;
      const salinanResult = await executeQuery<Array<{ id: number; nama_opsi: string }>>(salinanQuery, [tokenData.tamu_id]);
      caraSalinan = salinanResult.map(item => item.nama_opsi);
      caraSalinanIds = salinanResult.map(item => item.id);
    } catch (error) {
      console.error('Error fetching mendapatkan salinan data:', error);
    }

    // Add the additional information to the guest object
    const guestWithDetails = {
      ...guest,
      cara_memperoleh_informasi: caraMendapatkanInformasi,
      cara_mendapatkan_salinan: caraSalinan,
      cara_mendapatkan_salinan_ids: caraSalinanIds
    };

    return {
      tamuId: tokenData.tamu_id,
      status: status,
      details: guestWithDetails
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
      'SELECT * FROM tamu_token WHERE tamu_id = ? ORDER BY created_at DESC',
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
      'DELETE FROM tamu_token WHERE is_active = 0 AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );
    
    return result.affectedRows || 0;
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    throw error;
  }
}
