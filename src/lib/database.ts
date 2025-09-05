/**
 * Enhanced Database Connection Manager
 * Implements singleton pattern, connection pooling, and comprehensive error handling
 */

import mysql, { Pool, PoolConnection, PoolOptions, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { dbLogger } from '@/lib/logger';

// Database configuration interface
interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  connectionLimit?: number;
  acquireTimeout?: number;
  timeout?: number;
  reconnect?: boolean;
  charset?: string;
}

// Query result types
export type QueryResult<T = any> = T[] | T | ResultSetHeader;
export type TransactionCallback<T = any> = (connection: PoolConnection) => Promise<T>;

// Database metrics for monitoring
interface DatabaseMetrics {
  totalConnections: number;
  activeConnections: number;
  totalQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  lastConnectionCheck: Date;
}

/**
 * Singleton Database Manager Class
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private metrics: DatabaseMetrics;
  private isInitialized = false;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.loadConfig();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      totalQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      lastConnectionCheck: new Date()
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Load database configuration from environment
   */
  private loadConfig(): DatabaseConfig {
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'DB_PORT'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
      host: process.env.DB_HOST!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD || '', // Allow empty password for local development
      database: process.env.DB_NAME!,
      port: Number(process.env.DB_PORT!),
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
      acquireTimeout: Number(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
      timeout: Number(process.env.DB_TIMEOUT) || 60000,
      reconnect: true,
      charset: 'utf8mb4'
    };
  }

  /**
   * Initialize database connection pool
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized && this.pool) {
      dbLogger.debug('Database already initialized');
      return;
    }

    try {
      dbLogger.info('Initializing database connection pool...');

      const poolOptions: PoolOptions = {
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port,
        connectionLimit: this.config.connectionLimit,
        charset: this.config.charset,
        // Additional MySQL configurations
        typeCast: function (field, next) {
          // Convert TINYINT(1) to boolean
          if (field.type === 'TINY' && field.length === 1) {
            return (field.string() === '1');
          }
          return next();
        }
      };

      this.pool = mysql.createPool(poolOptions);

      // Test the connection
      await this.testConnection();
      
      // Set up connection monitoring
      this.setupConnectionMonitoring();
      
      this.isInitialized = true;
      
      dbLogger.info('Database connection pool initialized successfully', {
        host: this.config.host,
        database: this.config.database,
        connectionLimit: this.config.connectionLimit
      });

    } catch (error) {
      dbLogger.error('Failed to initialize database connection pool:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      this.metrics.lastConnectionCheck = new Date();
      dbLogger.debug('Database connection test successful');
    } catch (error) {
      dbLogger.error('Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Set up connection monitoring and health checks
   */
  private setupConnectionMonitoring(): void {
    // Health check every 5 minutes
    this.connectionCheckInterval = setInterval(async () => {
      try {
        await this.testConnection();
        dbLogger.debug('Periodic connection health check passed');
      } catch (error) {
        dbLogger.error('Periodic connection health check failed:', error);
        // Attempt to reinitialize the pool
        await this.reinitialize();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Reinitialize database connection pool
   */
  private async reinitialize(): Promise<void> {
    dbLogger.warn('Attempting to reinitialize database connection pool...');
    
    try {
      await this.close();
      this.isInitialized = false;
      await this.initialize();
      dbLogger.info('Database connection pool reinitialized successfully');
    } catch (error) {
      dbLogger.error('Failed to reinitialize database connection pool:', error);
      throw error;
    }
  }

  /**
   * Get a connection from the pool
   */
  public async getConnection(): Promise<PoolConnection> {
    if (!this.isInitialized || !this.pool) {
      await this.initialize();
    }

    try {
      const connection = await this.pool!.getConnection();
      this.metrics.activeConnections++;
      this.metrics.totalConnections++;
      
      dbLogger.debug('Database connection acquired', {
        activeConnections: this.metrics.activeConnections
      });

      return connection;
    } catch (error) {
      dbLogger.error('Failed to get database connection:', error);
      throw new Error(`Connection acquisition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Release a connection back to the pool
   */
  public releaseConnection(connection: PoolConnection): void {
    try {
      connection.release();
      this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
      
      dbLogger.debug('Database connection released', {
        activeConnections: this.metrics.activeConnections
      });
    } catch (error) {
      dbLogger.error('Error releasing database connection:', error);
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  public async executeQuery<T = any>(
    query: string,
    params: any[] = []
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    let connection: PoolConnection | null = null;

    try {
      connection = await this.getConnection();
      
      dbLogger.debug('Executing query', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        paramCount: params.length
      });

      const [results] = await connection.query(query, params);
      
      // Update metrics
      const queryTime = Date.now() - startTime;
      this.metrics.totalQueries++;
      this.metrics.averageQueryTime = 
        (this.metrics.averageQueryTime * (this.metrics.totalQueries - 1) + queryTime) / this.metrics.totalQueries;

      dbLogger.debug('Query executed successfully', {
        executionTime: queryTime,
        resultCount: Array.isArray(results) ? results.length : 'N/A'
      });

      return results as QueryResult<T>;

    } catch (error) {
      this.metrics.failedQueries++;
      dbLogger.error('Query execution failed:', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      if (connection) {
        this.releaseConnection(connection);
      }
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async executeTransaction<T = any>(
    callback: TransactionCallback<T>
  ): Promise<T> {
    let connection: PoolConnection | null = null;

    try {
      connection = await this.getConnection();
      
      dbLogger.debug('Starting database transaction');
      
      await connection.beginTransaction();
      
      const result = await callback(connection);
      
      await connection.commit();
      
      dbLogger.debug('Database transaction committed successfully');
      
      return result;

    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
          dbLogger.debug('Database transaction rolled back due to error');
        } catch (rollbackError) {
          dbLogger.error('Failed to rollback transaction:', rollbackError);
        }
      }
      
      dbLogger.error('Database transaction failed:', error);
      throw error;
    } finally {
      if (connection) {
        this.releaseConnection(connection);
      }
    }
  }

  /**
   * Get database metrics
   */
  public getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }

  /**
   * Get pool status
   */
  public getPoolStatus(): any {
    if (!this.pool) {
      return { status: 'not_initialized' };
    }

    // Access pool internals (be careful - this might change with mysql2 versions)
    const poolInternal = this.pool as any;
    
    return {
      status: 'active',
      connectionLimit: this.config.connectionLimit,
      activeConnections: this.metrics.activeConnections,
      allConnections: poolInternal._allConnections?.length || 0,
      freeConnections: poolInternal._freeConnections?.length || 0,
      acquiringConnections: poolInternal._acquiringConnections?.length || 0
    };
  }

  /**
   * Check if database is healthy
   */
  public async isHealthy(): Promise<boolean> {
    try {
      await this.testConnection();
      return true;
    } catch (error) {
      dbLogger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Close database connection pool
   */
  public async close(): Promise<void> {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    if (this.pool) {
      try {
        await this.pool.end();
        dbLogger.info('Database connection pool closed successfully');
      } catch (error) {
        dbLogger.error('Error closing database connection pool:', error);
      }
      this.pool = null;
    }

    this.isInitialized = false;
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance();

// Convenience functions for backward compatibility
export async function getConnection(): Promise<PoolConnection> {
  return db.getConnection();
}

export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  return db.executeQuery<T>(query, params);
}

export async function executeTransaction<T = any>(
  callback: TransactionCallback<T>
): Promise<T> {
  return db.executeTransaction<T>(callback);
}

// Initialize database on module load in production
if (process.env.NODE_ENV === 'production' || process.env.AUTO_INIT_DB === 'true') {
  db.initialize().catch(error => {
    dbLogger.error('Failed to auto-initialize database:', error);
  });
}

export default db;
