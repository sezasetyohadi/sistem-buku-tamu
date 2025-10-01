import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import Admin from '@/backend/models/adminModel';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'No access token provided',
      }, { status: 401 });
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Get admin profile from database
    const query = 'SELECT id, username, nama_lengkap, email, profile_picture, created_at, updated_at, bidang_tujuan_id FROM admin WHERE id = ?';
    const result = await executeQuery<Admin[]>(query, [payload.userId]);

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
        profile_picture: admin.profile_picture || null,
        created_at: admin.created_at,
        bidang_tujuan_id: admin.bidang_tujuan_id
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

export async function PUT(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'No access token provided',
      }, { status: 401 });
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { fullName, email, currentPassword, newPassword } = body;

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json({
        success: false,
        message: 'Nama lengkap dan email harus diisi',
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Format email tidak valid',
      }, { status: 400 });
    }

    // Get current admin data
    const currentAdminQuery = 'SELECT * FROM admin WHERE id = ?';
    const currentAdminResult = await executeQuery<Admin[]>(currentAdminQuery, [payload.userId]);

    if (!currentAdminResult || currentAdminResult.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin tidak ditemukan',
      }, { status: 404 });
    }

    const currentAdmin = currentAdminResult[0];

    // If password change is requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({
          success: false,
          message: 'Password saat ini diperlukan untuk mengubah password',
        }, { status: 400 });
      }

      // Validate current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentAdmin.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({
          success: false,
          message: 'Password saat ini tidak benar',
        }, { status: 400 });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          message: 'Password baru minimal 6 karakter',
        }, { status: 400 });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update admin with password
      const updateQuery = 'UPDATE admin SET nama_lengkap = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await executeQuery(updateQuery, [fullName, email, hashedNewPassword, payload.userId]);
    } else {
      // Update admin without password
      const updateQuery = 'UPDATE admin SET nama_lengkap = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await executeQuery(updateQuery, [fullName, email, payload.userId]);
    }

    // Get updated admin data
    const updatedAdminQuery = 'SELECT id, username, nama_lengkap, email, profile_picture, created_at, updated_at, bidang_tujuan_id FROM admin WHERE id = ?';
    const updatedAdminResult = await executeQuery<Admin[]>(updatedAdminQuery, [payload.userId]);
    const updatedAdmin = updatedAdminResult[0];

    return NextResponse.json({
      success: true,
      message: 'Profile berhasil diperbarui',
      admin: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        nama_lengkap: updatedAdmin.nama_lengkap,
        email: updatedAdmin.email,
        profile_picture: updatedAdmin.profile_picture,
        created_at: updatedAdmin.created_at,
        bidang_tujuan_id: updatedAdmin.bidang_tujuan_id
      }
    });

  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memperbarui profile',
    }, { status: 500 });
  }
}
