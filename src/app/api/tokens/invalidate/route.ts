import { NextRequest, NextResponse } from 'next/server';

import { deactivateToken, verifyToken } from '@/backend/services/tokenService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support deactivation by ID or token string
    if (!body.tokenId && !body.token) {
      return NextResponse.json(
        { success: false, message: 'Either token ID or token string is required' },
        { status: 400 }
      );
    }
    
    let tokenId: number;
    
    // If token string is provided, find the token ID
    if (body.token) {
      const tokenData = await verifyToken(body.token);
      if (!tokenData || !tokenData.id) {
        return NextResponse.json(
          { success: false, message: 'Invalid or inactive token' },
          { status: 404 }
        );
      }
      tokenId = tokenData.id;
    } else {
      tokenId = body.tokenId;
    }
    
    // Deactivate the token
    const result = await deactivateToken(tokenId);
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Failed to deactivate token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token deactivated successfully'
    });
    
  } catch (error: any) {
    console.error('Error deactivating token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to deactivate token', error: error.message },
      { status: 500 }
    );
  }
}
