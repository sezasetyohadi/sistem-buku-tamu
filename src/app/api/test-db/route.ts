/**
 * Database Test Route
 * Simple endpoint for testing database connectivity
 */

import { NextResponse } from 'next/server';
import { getConnection } from '@/backend/config/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Simple connectivity test
    await connection.execute('SELECT 1 as test');
    connection.release();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}