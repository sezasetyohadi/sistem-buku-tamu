import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredTokens } from '@/backend/services/tokenService';

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
    
    // Run the cleanup
    const deletedCount = await cleanupExpiredTokens();
    
    return NextResponse.json({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} expired tokens cleaned up successfully`
    });
    
  } catch (error: any) {
    console.error('Error cleaning up tokens:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clean up tokens', error: error.message },
      { status: 500 }
    );
  }
}
