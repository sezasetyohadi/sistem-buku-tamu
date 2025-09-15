import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import type { PoolOptions } from 'mysql2/promise';

import { DatabaseError } from '@/lib/error-handling';
import { dbLogger } from '@/lib/logger';

// Load environment variables from .env file
dotenv.config();

// Enhanced database connection configuration with performance optimizations
const dbConfig: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  
  // Connection Pool Configuration for Performance
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 20,
  queueLimit: Number(process.env.DB_QUEUE_LIMIT) || 0,
  
  // MySQL Performance Settings
  charset: 'utf8mb4',
  timezone: 'local',
  supportBigNumbers: true,
  bigNumberStrings: false,
  
  // Query Performance
  multipleStatements: false,
  
  // SSL Configuration (if needed)
  ...(process.env.DB_SSL === 'true' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
};

// Create an optimized connection pool
const pool = mysql.createPool(dbConfig);

// Performance monitoring variables
let queryCount = 0;
let slowQueryCount = 0;
const slowQueryThreshold = Number(process.env.SLOW_QUERY_THRESHOLD) || 1000; // 1 second

// Query performance monitoring
function logSlowQuery(query: string, duration: number, params?: any[]) {
  slowQueryCount++;
  dbLogger.warn('Slow Query Detected', {
    operation: 'SLOW_QUERY',
    duration,
    metadata: {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      paramCount: params?.length || 0
    }
  });
}

// Function to get a database connection
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    dbLogger.debug('Database connection acquired', { operation: 'GET_CONNECTION' });
    return connection;
  } catch (error) {
    dbLogger.error('Failed to get database connection', {
      operation: 'GET_CONNECTION_ERROR'
    }, error instanceof Error ? error : new Error(String(error)));
    throw new DatabaseError('Failed to connect to database', { error: String(error) });
  }
}

// Enhanced executeQuery with performance monitoring and optimization
export async function executeQuery<T>(
  query: string, 
  params: any[] = []
): Promise<T> {
  const startTime = Date.now();
  let connection;
  
  try {
    queryCount++;
    connection = await pool.getConnection();
    
    // Execute the query
    const [results] = await connection.query(query, params);
    
    // Performance monitoring
    const duration = Date.now() - startTime;
    if (duration > slowQueryThreshold) {
      logSlowQuery(query, duration, params);
    }
    
    // Log query stats every 100 queries in development
    if (process.env.NODE_ENV === 'development' && queryCount % 100 === 0) {
      console.log(`📊 Query Stats: ${queryCount} total, ${slowQueryCount} slow queries`);
    }
    
    return results as T;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Database query error [${duration}ms]:`, {
      error: error instanceof Error ? error.message : error,
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params: params ? params.slice(0, 5) : []
    });
    throw error;
  } finally {
    if (connection) {connection.release();}
  }
}

// Cached executeQuery for frequently accessed data
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const defaultCacheTTL = Number(process.env.QUERY_CACHE_TTL) || 300000; // 5 minutes

export async function executeQueryCached<T>(
  query: string,
  params: any[] = [],
  cacheTTL: number = defaultCacheTTL
): Promise<T> {
  const cacheKey = `${query}:${JSON.stringify(params)}`;
  const cached = queryCache.get(cacheKey);
  
  // Return cached result if valid
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  
  // Execute query and cache result
  const result = await executeQuery<T>(query, params);
  queryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
    ttl: cacheTTL
  });
  
  // Clean old cache entries periodically
  if (queryCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of queryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        queryCache.delete(key);
      }
    }
  }
  
  return result;
}

// Test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    connection.release();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// NOTE: Table creation and data insertion should be handled
// through database management tools or seed files

// Get education options with caching
export async function getEducationOptions(): Promise<Array<{ id: number, pendidikan_terakhir: string }>> {
  try {
    const options = await executeQueryCached<Array<{ id: number, pendidikan_terakhir: string }>>(
      'SELECT id, pendidikan_terakhir FROM pendidikan_terakhir ORDER BY id ASC',
      [],
      600000 // 10 minutes cache for lookup data
    );
    return options;
  } catch (error) {
    console.error('Error getting education options:', error);
    return [];
  }
}

// Get profession options with caching
export async function getProfessionOptions(): Promise<Array<{ id: number, nama_profesi: string }>> {
  try {
    const options = await executeQueryCached<Array<{ id: number, nama_profesi: string }>>(
      'SELECT id, nama_profesi FROM profesi ORDER BY id ASC',
      [],
      600000 // 10 minutes cache for lookup data
    );
    return options;
  } catch (error) {
    console.error('Error getting profession options:', error);
    return [];
  }
}

// Get tujuan kunjungan options with caching
export async function getTujuanKunjunganOptions(): Promise<Array<{ id: number, tujuan: string }>> {
  try {
    const options = await executeQueryCached<Array<{ id: number, tujuan: string }>>(
      'SELECT id, tujuan FROM tujuan_kunjungan WHERE id != 999 ORDER BY id ASC',
      [],
      600000 // 10 minutes cache for lookup data
    );
    return options;
  } catch (error) {
    console.error('Error getting tujuan kunjungan options:', error);
    return [];
  }
}

// Get bidang tujuan options with caching
export async function getBidangTujuanOptions(): Promise<Array<{ id: number, bidang: string }>> {
  try {
    const options = await executeQueryCached<Array<{ id: number, bidang: string }>>(
      'SELECT id, bidang FROM bidang_tujuan ORDER BY id ASC',
      [],
      600000 // 10 minutes cache for lookup data
    );
    return options;
  } catch (error) {
    console.error('Error getting bidang tujuan options:', error);
    return [];
  }
}

// Get cara memperoleh informasi options with caching
export async function getMemperolehInformasiOptions(): Promise<Array<{ id: number, nama_opsi: string }>> {
  try {
    const options = await executeQueryCached<Array<{ id: number, nama_opsi: string }>>(
      'SELECT id, nama_opsi FROM memperoleh_informasi ORDER BY id ASC',
      [],
      600000 // 10 minutes cache for lookup data
    );
    return options;
  } catch (error) {
    console.error('Error getting memperoleh informasi options:', error);
    return [];
  }
}

// Get cara mendapatkan salinan options with caching
export async function getMendapatkanSalinanOptions(): Promise<Array<{ id: number, nama_opsi: string }>> {
  try {
    const options = await executeQueryCached<Array<{ id: number, nama_opsi: string }>>(
      'SELECT id, nama_opsi FROM mendapatkan_salinan ORDER BY id ASC',
      [],
      600000 // 10 minutes cache for lookup data
    );
    return options;
  } catch (error) {
    console.error('Error getting mendapatkan salinan options:', error);
    return [];
  }
}

// Database performance monitoring functions
export function getDatabaseStats() {
  return {
    totalQueries: queryCount,
    slowQueries: slowQueryCount,
    cacheSize: queryCache.size,
    poolConnections: pool.config.connectionLimit,
    timestamp: new Date().toISOString()
  };
}

export function clearQueryCache() {
  queryCache.clear();
  console.log('🧹 Query cache cleared');
}

// Pool health monitoring
export async function getPoolStatus() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return {
      status: 'healthy',
      connectionLimit: pool.config.connectionLimit,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}