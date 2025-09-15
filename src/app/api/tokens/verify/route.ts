import { NextRequest, NextResponse } from 'next/server';

import { verifyToken, deactivateToken, getTokenStatus } from '@/backend/services/tokenService';

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
        { success: false, message: 'Invalid or inactive token' },
        { status: 400 }
      );
    }
    
    // Get booking status
    const status = await getTokenStatus(body.token);
    
    // If deactivation is requested
    if (body.deactivate) {
      await deactivateToken(tokenData.id!);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        token: tokenData.token,
        tamuId: tokenData.tamu_id,
        is_active: tokenData.is_active,
        created_at: tokenData.created_at,
        bookingStatus: status
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
