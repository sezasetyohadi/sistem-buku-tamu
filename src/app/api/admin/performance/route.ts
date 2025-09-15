/**
 * Database Performance Monitoring API
 * GET /api/admin/performance
 */

import { NextRequest, NextResponse } from 'next/server';

import { getPerformanceMetrics } from '@/backend/services/database-performance.service';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication token required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token, 'admin-panel');
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get performance metrics
    const metrics = await getPerformanceMetrics();

    return NextResponse.json({
      success: true,
      data: {
        ...metrics,
        server: {
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024)
          },
          uptime: Math.round(process.uptime()),
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });

  } catch (error) {
    console.error('Performance monitoring error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
