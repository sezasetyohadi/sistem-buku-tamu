import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
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

    // Get fresh admin data from database including profile picture
    const adminQuery = `
      SELECT id, username, email, nama_lengkap, is_super_admin, profile_picture, created_at
      FROM admin 
      WHERE id = ?
    `;
    
    const adminResult = await executeQuery<any[]>(adminQuery, [payload.userId]);
    
    if (!adminResult || adminResult.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin tidak ditemukan'
      }, { status: 404 });
    }

    const admin = adminResult[0];
    
    // Return fresh admin data
    return NextResponse.json({
      success: true,
      admin: {
        userId: admin.id,
        username: admin.username,
        email: admin.email,
        nama_lengkap: admin.nama_lengkap,
        is_super_admin: admin.is_super_admin,
        profile_picture: admin.profile_picture,
        created_at: admin.created_at
      }
    });

  } catch (error) {
    console.error('Get current admin error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data admin'
    }, { status: 500 });
  }
}
