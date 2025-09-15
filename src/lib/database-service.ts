/**
 * Database Service Layer
 * Provides high-level database operations with proper error handling
 */

import { PoolConnection } from 'mysql2/promise';

import { db, executeQuery, executeTransaction } from './database';
import { dbLogger } from './logger';

// Common database operation result
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
  insertId?: number;
}

// Pagination options
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Paginated result
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Base Database Service Class
 */
export abstract class BaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find records by criteria
   */
  async findBy<T = any>(
    criteria: Record<string, any>,
    options?: {
      select?: string[];
      orderBy?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<DatabaseResult<T[]>> {
    try {
      const selectFields = options?.select?.join(', ') || '*';
      const whereClause = Object.keys(criteria).map(key => `${key} = ?`).join(' AND ');
      const whereValues = Object.values(criteria);

      let query = `SELECT ${selectFields} FROM ${this.tableName}`;
      
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }
      
      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      }
      
      if (options?.limit) {
        query += ` LIMIT ${options.limit}`;
        if (options?.offset) {
          query += ` OFFSET ${options.offset}`;
        }
      }

      const results = await executeQuery(query, whereValues) as T[];
      
      return {
        success: true,
        data: Array.isArray(results) ? results : []
      };

    } catch (error) {
      dbLogger.error(`Error in findBy for table ${this.tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }

  /**
   * Find single record by ID
   */
  async findById<T = any>(id: number | string): Promise<DatabaseResult<T | null>> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
      const results = await executeQuery(query, [id]) as T[];
      
      return {
        success: true,
        data: results && results.length > 0 ? results[0] : null
      };

    } catch (error) {
      dbLogger.error(`Error in findById for table ${this.tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }

  /**
   * Create new record
   */
  async create<T = any>(data: Record<string, any>): Promise<DatabaseResult<T>> {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
      const result = await executeQuery(query, values) as any;

      return {
        success: true,
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };

    } catch (error) {
      dbLogger.error(`Error in create for table ${this.tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }

  /**
   * Update record by ID
   */
  async updateById(id: number | string, data: Record<string, any>): Promise<DatabaseResult> {
    try {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      const result = await executeQuery(query, values) as any;

      return {
        success: true,
        affectedRows: result.affectedRows
      };

    } catch (error) {
      dbLogger.error(`Error in updateById for table ${this.tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }

  /**
   * Delete record by ID
   */
  async deleteById(id: number | string): Promise<DatabaseResult> {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const result = await executeQuery(query, [id]) as any;

      return {
        success: true,
        affectedRows: result.affectedRows
      };

    } catch (error) {
      dbLogger.error(`Error in deleteById for table ${this.tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }

  /**
   * Get paginated results
   */
  async paginate<T = any>(
    options: PaginationOptions,
    criteria?: Record<string, any>
  ): Promise<DatabaseResult<PaginatedResult<T>>> {
    try {
      const offset = (options.page - 1) * options.limit;
      const whereClause = criteria ? Object.keys(criteria).map(key => `${key} = ?`).join(' AND ') : '';
      const whereValues = criteria ? Object.values(criteria) : [];

      // Count total records
      let countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      if (whereClause) {
        countQuery += ` WHERE ${whereClause}`;
      }

      const countResult = await executeQuery(countQuery, whereValues) as Array<{ total: number }>;
      const total = countResult[0]?.total || 0;

      // Get paginated data
      let dataQuery = `SELECT * FROM ${this.tableName}`;
      if (whereClause) {
        dataQuery += ` WHERE ${whereClause}`;
      }
      
      if (options.sortBy) {
        dataQuery += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
      }
      
      dataQuery += ` LIMIT ${options.limit} OFFSET ${offset}`;

      const data = await executeQuery(dataQuery, whereValues) as T[];
      const totalPages = Math.ceil(total / options.limit);

      return {
        success: true,
        data: {
          data: Array.isArray(data) ? data : [],
          total,
          page: options.page,
          limit: options.limit,
          totalPages,
          hasNext: options.page < totalPages,
          hasPrev: options.page > 1
        }
      };

    } catch (error) {
      dbLogger.error(`Error in paginate for table ${this.tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }
}

/**
 * Specific service implementations
 */

export class AdminService extends BaseService {
  constructor() {
    super('admin');
  }

  async findByUsername(username: string) {
    return this.findBy({ username }, { limit: 1 });
  }

  async updateProfile(id: number, profileData: Record<string, any>) {
    return this.updateById(id, {
      ...profileData,
      updated_at: new Date()
    });
  }
}

export class GuestService extends BaseService {
  constructor() {
    super('daftar_tamu');
  }

  async findByEmail(email: string) {
    return this.findBy({ email });
  }

  async findByToken(token: string) {
    return this.findBy({ token }, { limit: 1 });
  }

  async updateStatus(id: number, status: string) {
    return this.updateById(id, {
      status,
      updated_at: new Date()
    });
  }

  async getVisitorStats(startDate: string, endDate: string) {
    try {
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          status
        FROM ${this.tableName}
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at), status
        ORDER BY date ASC
      `;

      const results = await executeQuery(query, [startDate, endDate]);
      
      return {
        success: true,
        data: results
      };

    } catch (error) {
      dbLogger.error('Error getting visitor stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }
}

export class SurveyService extends BaseService {
  constructor() {
    super('pertanyaan_survei');
  }

  async getActiveQuestions() {
    return this.findBy({ status: true }, { orderBy: 'urutan ASC' });
  }

  async getQuestionsWithRatings() {
    try {
      const query = `
        SELECT 
          ps.*,
          GROUP_CONCAT(
            CONCAT(psjr.jenis_rating_id, ':', psjr.is_required, ':', jr.nama_rating)
            ORDER BY psjr.urutan ASC
          ) as rating_info
        FROM pertanyaan_survei ps
        LEFT JOIN pertanyaan_s_jenis_rating psjr ON ps.id = psjr.pertanyaan_survei_id
        LEFT JOIN jenis_rating jr ON psjr.jenis_rating_id = jr.id
        WHERE ps.status = true
        GROUP BY ps.id
        ORDER BY ps.urutan ASC
      `;

      const results = await executeQuery(query);
      
      return {
        success: true,
        data: results
      };

    } catch (error) {
      dbLogger.error('Error getting questions with ratings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }
}

/**
 * Database Health Check Service
 */
export class HealthCheckService {
  static async checkHealth(): Promise<{
    healthy: boolean;
    details: Record<string, any>;
  }> {
    try {
      const startTime = Date.now();
      const isHealthy = await db.isHealthy();
      const responseTime = Date.now() - startTime;

      const metrics = db.getMetrics();
      const poolStatus = db.getPoolStatus();

      return {
        healthy: isHealthy,
        details: {
          responseTime,
          metrics,
          poolStatus,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      dbLogger.error('Health check failed:', error);
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// Export service instances
export const adminService = new AdminService();
export const guestService = new GuestService();
export const surveyService = new SurveyService();

/**
 * Utility functions for transactions
 */
export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<DatabaseResult<T>> {
  try {
    const result = await executeTransaction(callback);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    dbLogger.error('Transaction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction error'
    };
  }
}

/**
 * Legacy executeQuery wrapper for backward compatibility
 * Automatically handles ResultSetHeader vs array results
 */
export async function legacyExecuteQuery<T = any>(
  query: string, 
  params?: any[]
): Promise<T> {
  try {
    const result = await executeQuery(query, params);
    
    // If it's a SELECT query, return the array result
    if (Array.isArray(result)) {
      return result as T;
    }
    
    // If it's an INSERT/UPDATE/DELETE, return the ResultSetHeader
    return result as T;
    
  } catch (error) {
    dbLogger.error('Legacy executeQuery failed:', error);
    throw error;
  }
}

export { db as database, executeQuery, executeTransaction };
