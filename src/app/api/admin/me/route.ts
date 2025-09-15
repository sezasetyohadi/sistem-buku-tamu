import { NextRequest, NextResponse } from 'next/server';

import { verifyToken } from '../../../../lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'Token tidak ditemukan'
      }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(accessToken, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Token tidak valid'
      }, { status: 401 });
    }

    // Return user data from token
    const { iat, exp, userType, ...userData } = payload;
    
    return NextResponse.json({
      success: true,
      admin: userData
    });

  } catch (error) {
    console.error('Get current admin error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data admin'
    }, { status: 500 });
  }
}
