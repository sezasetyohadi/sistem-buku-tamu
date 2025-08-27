import { NextRequest, NextResponse } from 'next/server';
import { invalidateToken } from '@/backend/services/tokenService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.tokenId) {
      return NextResponse.json(
        { success: false, message: 'Token ID is required' },
        { status: 400 }
      );
    }
    
    // Invalidate the token
    const result = await invalidateToken(body.tokenId);
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Failed to invalidate token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token invalidated successfully'
    });
    
  } catch (error: any) {
    console.error('Error invalidating token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to invalidate token', error: error.message },
      { status: 500 }
    );
  }
}
