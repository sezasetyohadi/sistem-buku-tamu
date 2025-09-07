/**
 * API Health Check Endpoint - SECURED
 * Provides system health information using standardized response format
 * Requires admin authentication for detailed health data
 */

import { NextRequest } from 'next/server';
import { HealthCheckService } from '../../../lib/database-service';
import { dbLogger } from '../../../lib/logger';
import { withApiMiddleware } from '@/lib/api-middleware';
import { HttpStatus } from '@/lib/api-response';
import { verifyToken } from '@/lib/jwt';

// Basic health check interface (public)
interface BasicHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
}

// Detailed health check interface (admin only)
interface DetailedHealthCheck extends BasicHealthCheck {
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      activeConnections?: number;
      error?: string;
    };
    api: {
      status: 'operational' | 'degraded' | 'down';
      responseTime: number;
    };
  };
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      used: number;
      total: number;
      usage: string;
    };
  };
}

// Helper function to check admin authentication
function checkAdminAuth(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('admin_access_token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) return false;

    const payload = verifyToken(token, 'admin-panel');
    return payload?.userType === 'admin';
    
  } catch {
    return false;
  }
}

export const GET = withApiMiddleware(async (request, response, context) => {
  const startTime = Date.now();
  const isAdmin = checkAdminAuth(request);
  
  // For non-admin users, return basic health status only
  if (!isAdmin) {
    try {
      const healthCheck = await HealthCheckService.checkHealth();
      const basicStatus: BasicHealthCheck = {
        status: healthCheck.healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };
      
      return response.success(basicStatus, 'Basic health check completed');
    } catch {
      return response.success({
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString()
      }, 'Basic health check completed');
    }
  }

  // Full detailed health check for admin users
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  // Test database connection using existing health check service
  let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
  let dbResponseTime: number | undefined;
  let dbError: string | undefined;
  
  try {
    const healthCheck = await HealthCheckService.checkHealth();
    
    dbResponseTime = healthCheck.details.responseTime;
    dbStatus = healthCheck.healthy ? 'connected' : 'error';
    
    if (!healthCheck.healthy) {
      overallStatus = 'unhealthy';
      dbError = 'Database connection failed';
    } else if (dbResponseTime > 1000) {
      overallStatus = 'degraded';
    }
    
    dbLogger.info('Database health check performed', {
      healthy: healthCheck.healthy,
      responseTime: healthCheck.details.responseTime
    });
    
  } catch (error: any) {
    dbStatus = 'error';
    dbError = error.message;
    overallStatus = 'unhealthy';
    
    dbLogger.error('Health check error:', error);
  }
  
  // Calculate API response time
  const apiResponseTime = Date.now() - startTime;
  
  // Get system information
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  const healthData: DetailedHealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        error: dbError,
      },
      api: {
        status: apiResponseTime < 500 ? 'operational' : 'degraded',
        responseTime: apiResponseTime,
      },
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        usage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`,
      },
    },
  };
  
  // Determine HTTP status based on health
  let httpStatus: number = HttpStatus.OK;
  if (overallStatus === 'unhealthy') {
    httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
  }
  
  const message = {
    healthy: 'All systems operational',
    degraded: 'Some services experiencing issues',
    unhealthy: 'Critical services unavailable',
  }[overallStatus];
  
  return response.success(
    healthData,
    message,
    httpStatus,
    {
      performance: {
        executionTime: Date.now() - startTime,
      },
    }
  );
});
