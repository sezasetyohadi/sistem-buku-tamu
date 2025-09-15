import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRefreshToken, generateAdminTokens } from '../../../../lib/jwt';
import { findByUsername } from '../../../../backend/services/adminService';
import { getConnection } from '../../../../backend/config/db';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('admin_refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token tidak ditemukan'
      }, { status: 401 });
    }

    // Verify refresh token
    const decoded = verifyAdminRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token tidak valid'
      }, { status: 401 });
    }

    // Connect to database and get fresh admin data
    connection = await getConnection();
    const admin = await findByUsername(decoded.username);
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin tidak ditemukan'
      }, { status: 401 });
    }

    // Generate new tokens
    if (!admin.id || !admin.username || !admin.email || !admin.nama_lengkap || admin.is_super_admin === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Data admin tidak lengkap'
      }, { status: 500 });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateAdminTokens({
      userId: admin.id,
      username: admin.username,
      email: admin.email,
      nama_lengkap: admin.nama_lengkap,
      is_super_admin: admin.is_super_admin
    });

    // Create response
    const { password: _, ...adminData } = admin;
    const response = NextResponse.json({
      success: true,
      message: 'Token berhasil diperbaharui',
      admin: adminData
    });

    // Set new cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const accessTokenMaxAge = 24 * 60 * 60; // 24 hours
    const refreshTokenMaxAge = 7 * 24 * 60 * 60; // 7 days

    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    });

    response.cookies.set('admin_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin token refresh error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat memperbaharui token'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
