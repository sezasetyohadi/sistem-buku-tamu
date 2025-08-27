import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, invalidateToken } from '@/backend/services/tokenService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Verify the token
    const tokenData = await verifyToken(body.token);
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    // If invalidation is requested
    if (body.invalidate) {
      await invalidateToken(tokenData.id!);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        tamuId: tokenData.tamu_id,
        tipe: tokenData.tipe,
        expires_at: tokenData.expires_at
      },
      message: 'Token verified successfully'
    });
    
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify token', error: error.message },
      { status: 500 }
    );
  }
}
