import { NextRequest, NextResponse } from 'next/server';
import { findByUsername, validatePassword } from '../../../../backend/services/adminService';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username dan password harus diisi'
      }, { status: 400 });
    }

    // Find admin by username
    const admin = await findByUsername(username);
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Username atau password tidak valid'
      }, { status: 401 });
    }

    // Validate password
    const isValidPassword = await validatePassword(password, admin.password);
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Username atau password tidak valid'
      }, { status: 401 });
    }

    // Login successful - return admin data (without password)
    const { password: _, ...adminData } = admin;
    
    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      admin: adminData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    }, { status: 500 });
  }
}
