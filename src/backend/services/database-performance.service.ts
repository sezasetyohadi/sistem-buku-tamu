/**
 * Database Performance Service
 * Provides optimized query functions and performance monitoring
 */

import { executeQuery, executeQueryCached, getDatabaseStats, getPoolStatus } from '../config/db';
import { dbLogger } from '@/lib/logger';
import { handleDatabaseError } from '@/lib/error-handling';

export interface GuestQueryFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  bidangTujuan?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GuestSummary {
  id: number;
  nama: string;
  email: string;
  asal_instansi: string;
  status_kunjungan: string;
  waktu_dibuat: string;
  bidang: string;
}

/**
 * Optimized guest list query with pagination and filtering
 */
export async function getGuestsPaginated(filters: GuestQueryFilters = {}): Promise<{
  guests: GuestSummary[];
  total: number;
  page: number;
  limit: number;
}> {
  const {
    status,
    dateFrom,
    dateTo,
    bidangTujuan,
    limit = 20,
    offset = 0,
    search
  } = filters;

  // Build optimized query with proper indexing
  let whereConditions: string[] = [];
  let queryParams: any[] = [];

  if (status) {
    whereConditions.push('dt.status_kunjungan = ?');
    queryParams.push(status);
  }

  if (dateFrom && dateTo) {
    whereConditions.push('DATE(dt.waktu_dibuat) BETWEEN ? AND ?');
    queryParams.push(dateFrom, dateTo);
  }

  if (bidangTujuan) {
    whereConditions.push('dt.bidang_tujuan_id = ?');
    queryParams.push(bidangTujuan);
  }

  if (search) {
    whereConditions.push('(dt.nama LIKE ? OR dt.email LIKE ? OR dt.asal_instansi LIKE ?)');
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Optimized query using proper indexes
  const guestsQuery = `
    SELECT 
      dt.id,
      dt.nama,
      dt.email,
      dt.asal_instansi,
      dt.status_kunjungan,
      dt.waktu_dibuat,
      bt.bidang
    FROM daftar_tamu dt
    LEFT JOIN bidang_tujuan bt ON dt.bidang_tujuan_id = bt.id
    ${whereClause}
    ORDER BY dt.waktu_dibuat DESC
    LIMIT ? OFFSET ?
  `;

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM daftar_tamu dt
    ${whereClause}
  `;

  try {
    dbLogger.debug('Executing paginated guest query', {
      operation: 'GET_GUESTS_PAGINATED',
      metadata: { limit, offset, whereConditions: whereConditions.length }
    });

    // Execute both queries in parallel for better performance
    const [guests, countResult] = await Promise.all([
      executeQuery<GuestSummary[]>(guestsQuery, [...queryParams, limit, offset]),
      executeQuery<Array<{ total: number }>>(countQuery, queryParams)
    ]);

    dbLogger.debug('Paginated guest query completed', {
      operation: 'GET_GUESTS_PAGINATED_SUCCESS',
      metadata: { resultCount: guests.length, total: countResult[0]?.total || 0 }
    });

    return {
      guests,
      total: countResult[0]?.total || 0,
      page: Math.floor(offset / limit) + 1,
      limit
    };
  } catch (error) {
    dbLogger.error('Error in getGuestsPaginated', {
      operation: 'GET_GUESTS_PAGINATED_ERROR',
      metadata: { limit, offset, queryParamsCount: queryParams.length }
    }, error instanceof Error ? error : new Error(String(error)));
    
    handleDatabaseError(error, 'getGuestsPaginated');
  }
}

/**
 * Optimized guest statistics with caching
 */
export async function getGuestStatistics(): Promise<{
  totalGuests: number;
  todayGuests: number;
  completedVisits: number;
  pendingVisits: number;
}> {
  try {
    const stats = await executeQueryCached<Array<{
      totalGuests: number;
      todayGuests: number;
      completedVisits: number;
      pendingVisits: number;
    }>>(
      `
      SELECT 
        COUNT(*) as totalGuests,
        SUM(CASE WHEN DATE(waktu_dibuat) = CURDATE() THEN 1 ELSE 0 END) as todayGuests,
        SUM(CASE WHEN status_kunjungan = 'Selesai' THEN 1 ELSE 0 END) as completedVisits,
        SUM(CASE WHEN status_kunjungan IN ('Menunggu', 'Terjadwal', 'Datang') THEN 1 ELSE 0 END) as pendingVisits
      FROM daftar_tamu
      `,
      [],
      60000 // Cache for 1 minute
    );

    return stats[0] || {
      totalGuests: 0,
      todayGuests: 0,
      completedVisits: 0,
      pendingVisits: 0
    };
  } catch (error) {
    console.error('Error getting guest statistics:', error);
    throw error;
  }
}

/**
 * Optimized admin query with minimal data
 */
export async function getAdminByUsername(username: string) {
  try {
    const result = await executeQuery<Array<{
      id: number;
      username: string;
      password: string;
      nama_lengkap: string;
      email: string;
      failed_attempts: number;
      locked_until: string | null;
    }>>(
      'SELECT id, username, password, nama_lengkap, email, failed_attempts, locked_until FROM admin WHERE username = ? LIMIT 1',
      [username]
    );

    return result[0] || null;
  } catch (error) {
    console.error('Error getting admin by username:', error);
    throw error;
  }
}

/**
 * Batch update for better performance
 */
export async function updateGuestStatus(guestIds: number[], status: string): Promise<void> {
  if (guestIds.length === 0) return;

  const placeholders = guestIds.map(() => '?').join(',');
  const query = `
    UPDATE daftar_tamu 
    SET status_kunjungan = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id IN (${placeholders})
  `;

  try {
    await executeQuery(query, [status, ...guestIds]);
  } catch (error) {
    console.error('Error in batch update guest status:', error);
    throw error;
  }
}

/**
 * Performance monitoring endpoint data
 */
export async function getPerformanceMetrics() {
  try {
    const [dbStats, poolStatus] = await Promise.all([
      getDatabaseStats(),
      getPoolStatus()
    ]);

    return {
      database: dbStats,
      pool: poolStatus,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    throw error;
  }
}

/**
 * Optimized search across multiple fields
 */
export async function searchGuests(searchTerm: string, limit: number = 10): Promise<GuestSummary[]> {
  if (!searchTerm.trim()) return [];

  try {
    const results = await executeQuery<GuestSummary[]>(
      `
      SELECT 
        dt.id,
        dt.nama,
        dt.email,
        dt.asal_instansi,
        dt.status_kunjungan,
        dt.waktu_dibuat,
        bt.bidang
      FROM daftar_tamu dt
      LEFT JOIN bidang_tujuan bt ON dt.bidang_tujuan_id = bt.id
      WHERE 
        dt.nama LIKE ? OR 
        dt.email LIKE ? OR 
        dt.asal_instansi LIKE ? OR
        dt.keperluan LIKE ?
      ORDER BY 
        CASE 
          WHEN dt.nama LIKE ? THEN 1
          WHEN dt.email LIKE ? THEN 2
          ELSE 3
        END,
        dt.waktu_dibuat DESC
      LIMIT ?
      `,
      [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `${searchTerm}%`, // Exact match priority
        `${searchTerm}%`, // Exact match priority
        limit
      ]
    );

    return results;
  } catch (error) {
    console.error('Error in searchGuests:', error);
    throw error;
  }
}
