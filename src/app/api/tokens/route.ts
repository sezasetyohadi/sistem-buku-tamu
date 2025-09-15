import { NextRequest, NextResponse } from 'next/server';

import { 
  createToken, 
  getTokensByTamuId,
  cleanupOldTokens,
  getTokenStatus
} from '@/backend/services/tokenService';

// Create a new token for a guest booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.tamuId) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }
    
    // Create token for guest booking status
    const tokenData = await createToken(body.tamuId);
    
    return NextResponse.json({
      success: true,
      data: {
        id: tokenData.id,
        tamu_id: tokenData.tamu_id,
        token: tokenData.token, // Include token as this is needed by client for status checks
        is_active: tokenData.is_active,
        created_at: tokenData.created_at
      },
      message: 'Booking status token created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create booking token', error: error.message },
      { status: 500 }
    );
  }
}

// Get tokens for a guest or check status with token
export async function GET(request: NextRequest) {
  try {
    const tamuId = request.nextUrl.searchParams.get('tamuId');
    const token = request.nextUrl.searchParams.get('token');
    
    // If token is provided, check booking status
    if (token) {
      const status = await getTokenStatus(token);
      
      if (!status) {
        return NextResponse.json(
          { success: false, message: 'Invalid or inactive token' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: status,
        message: 'Booking status retrieved successfully'
      });
    }
    
    // If tamuId is provided, get all tokens for this guest
    if (tamuId) {
      const tokens = await getTokensByTamuId(parseInt(tamuId));
      
      // Clean up old inactive tokens as a side effect
      await cleanupOldTokens();
      
      return NextResponse.json({
        success: true,
        data: tokens.map(t => ({
          id: t.id,
          tamu_id: t.tamu_id,
          token: t.token, // Include token as this is needed for status checks
          is_active: t.is_active,
          created_at: t.created_at
        })),
        message: 'Booking tokens retrieved successfully'
      });
    }
    
    // If neither parameter is provided
    return NextResponse.json(
      { success: false, message: 'Either guest ID or token is required' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Error processing token request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process token request', error: error.message },
      { status: 500 }
    );
  }
}
