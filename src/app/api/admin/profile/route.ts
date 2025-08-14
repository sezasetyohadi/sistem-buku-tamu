import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import Admin from '@/backend/models/adminModel';

export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated through cookie
    const authCookie = request.cookies.get('admin_auth');

    if (!authCookie) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 });
    }

    // Get admin ID from the session header
    const adminSessionHeader = request.headers.get('x-admin-session');
    
    if (!adminSessionHeader) {
      return NextResponse.json({
        success: false,
        message: 'Admin session not found',
      }, { status: 401 });
    }

    let adminId;
    try {
      const adminSession = JSON.parse(adminSessionHeader);
      adminId = adminSession.id;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid admin session format',
      }, { status: 400 });
    }

    // Get admin profile from database
    const query = 'SELECT id, username, nama_lengkap, email, created_at, is_super_admin FROM admin WHERE id = ?';
    const result = await executeQuery<Admin[]>(query, [adminId]);

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found',
      }, { status: 404 });
    }

    const admin = result[0];

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        nama_lengkap: admin.nama_lengkap || 'Administrator',
        email: admin.email || '',
        created_at: admin.created_at,
        is_super_admin: admin.is_super_admin
      }
    });

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch admin profile',
    }, { status: 500 });
  }
}
