import { NextRequest, NextResponse } from 'next/server';

import { cleanupOldTokens } from '@/backend/services/tokenService';

export async function GET(request: NextRequest) {
  try {
    // Check for a security key to prevent unauthorized access
    const securityKey = request.nextUrl.searchParams.get('key');
    const configKey = process.env.TOKEN_CLEANUP_KEY;
    
    if (!configKey || securityKey !== configKey) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get the number of days to keep tokens (default 30)
    const days = request.nextUrl.searchParams.get('days');
    const daysToKeep = days ? parseInt(days) : 30;
    
    // Run the cleanup of old inactive tokens
    const deletedCount = await cleanupOldTokens(daysToKeep);
    
    return NextResponse.json({
      success: true,
      data: { deletedCount, daysKept: daysToKeep },
      message: `${deletedCount} old inactive tokens cleaned up successfully`
    });
    
  } catch (error: any) {
    console.error('Error cleaning up tokens:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clean up tokens', error: error.message },
      { status: 500 }
    );
  }
}
