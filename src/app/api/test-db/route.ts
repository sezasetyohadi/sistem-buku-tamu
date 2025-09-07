/**
 * Database Test Route - SECURED
 * Simple endpoint for testing database connectivity
 * Requires admin authentication for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/backend/config/db';
import { verifyToken } from '@/lib/jwt';

// Security middleware for diagnostic endpoints
async function verifyAdminAccess(request: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  try {
    // Check for admin token
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('admin_access_token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) {
      return { authorized: false, error: 'No authentication token provided' };
    }

    // Verify JWT token
    const payload = verifyToken(token, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      return { authorized: false, error: 'Invalid or expired token' };
    }

    return { authorized: true };
    
  } catch (error) {
    return { authorized: false, error: 'Token verification failed' };
  }
}

export async function GET(request: NextRequest) {
  // Security check - only admin can access diagnostic endpoints
  const authCheck = await verifyAdminAccess(request);
  
  if (!authCheck.authorized) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized access to diagnostic endpoint',
      error: authCheck.error
    }, { status: 401 });
  }

  try {
    const connection = await getConnection();
    
    // Extended connectivity test
    const startTime = Date.now();
    await connection.execute('SELECT 1 as test');
    const responseTime = Date.now() - startTime;
    
    // Get additional database info
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    const [connectionResult] = await connection.execute('SELECT CONNECTION_ID() as connection_id');
    
    connection.release();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        responseTime: `${responseTime}ms`,
        version: (versionResult as any[])[0]?.version,
        connectionId: (connectionResult as any[])[0]?.connection_id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}