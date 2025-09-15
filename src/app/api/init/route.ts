import { NextRequest, NextResponse } from 'next/server';

import { testConnection } from '@/backend/config/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to database. Please check your .env configuration.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection tested successfully'
    });
  } catch (error: any) {
    console.error('Error testing database connection:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
