import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token dan password baru diperlukan' },
        { status: 400 }
      );
    }

    // Validasi password
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cari token reset password yang valid
    const resetTokens = await executeQuery<any[]>(
      `SELECT pr.*, a.id as admin_id, a.username, a.email 
       FROM password_resets pr 
       JOIN admin a ON pr.admin_id = a.id 
       WHERE pr.token = ? AND pr.expires_at > NOW() AND pr.used_at IS NULL 
       LIMIT 1`,
      [token]
    );
    
    if (!resetTokens || resetTokens.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      );
    }

    const resetToken = resetTokens[0];
    
    // Hash password baru
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password admin
    await executeQuery(
      'UPDATE admin SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, resetToken.admin_id]
    );

    // Tandai token sebagai sudah digunakan
    await executeQuery(
      'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
      [resetToken.id]
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password berhasil direset. Silakan login dengan password baru Anda.' 
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error in reset password:', error);
    
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat reset password' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token diperlukan' },
        { status: 400 }
      );
    }

    // Verifikasi token reset password
    const resetTokens = await executeQuery<any[]>(
      `SELECT pr.*, a.username, a.email 
       FROM password_resets pr 
       JOIN admin a ON pr.admin_id = a.id 
       WHERE pr.token = ? AND pr.expires_at > NOW() AND pr.used_at IS NULL 
       LIMIT 1`,
      [token]
    );
    
    if (!resetTokens || resetTokens.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Token valid',
        admin: {
          username: resetTokens[0].username,
          email: resetTokens[0].email
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error verifying reset token:', error);
    
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat verifikasi token' },
      { status: 500 }
    );
  }
}
