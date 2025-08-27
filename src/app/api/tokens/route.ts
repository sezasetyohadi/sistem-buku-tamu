import { NextRequest, NextResponse } from 'next/server';
import { 
  createToken, 
  verifyToken, 
  invalidateToken,
  getTokensByTamuId,
  cleanupExpiredTokens
} from '@/backend/services/tokenService';

// Create a new token for a guest
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
    
    // Create token with optional parameters
    const tokenData = await createToken(
      body.tamuId,
      body.tipe || 'verifikasi',
      body.expiryHours || 24
    );
    
    return NextResponse.json({
      success: true,
      data: {
        ...tokenData,
        // Don't send the actual token in response for security reasons
        // unless it's specifically needed by the client
        token: tokenData.token
      },
      message: 'Token created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create token', error: error.message },
      { status: 500 }
    );
  }
}

// Get all tokens (primarily for admin/debug use)
export async function GET(request: NextRequest) {
  try {
    // This endpoint only supports filtering by tamu_id
    const tamuId = request.nextUrl.searchParams.get('tamuId');
    
    if (!tamuId) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }
    
    const tokens = await getTokensByTamuId(parseInt(tamuId));
    
    // Clean up expired tokens as a side effect
    // This is optional and can be moved to a scheduled job
    await cleanupExpiredTokens();
    
    return NextResponse.json({
      success: true,
      data: tokens.map(t => ({
        ...t,
        // Don't send the actual token in response for security reasons
        token: undefined
      })),
      message: 'Tokens retrieved successfully'
    });
    
  } catch (error: any) {
    console.error('Error getting tokens:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve tokens', error: error.message },
      { status: 500 }
    );
  }
}
