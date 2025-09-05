/**
 * Database Health Check API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { HealthCheckService } from '../../../lib/database-service';
import { dbLogger } from '../../../lib/logger';

export async function GET(request: NextRequest) {
  try {
    const healthCheck = await HealthCheckService.checkHealth();
    
    dbLogger.info('Database health check performed', {
      healthy: healthCheck.healthy,
      responseTime: healthCheck.details.responseTime
    });

    return NextResponse.json({
      status: healthCheck.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      ...healthCheck.details
    }, {
      status: healthCheck.healthy ? 200 : 503
    });

  } catch (error) {
    dbLogger.error('Health check endpoint error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}
