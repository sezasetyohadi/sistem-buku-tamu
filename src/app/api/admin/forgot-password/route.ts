import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { executeQuery } from '@/backend/config/db';
import { getFullUrl } from '@/lib/url-utils';

// Konfigurasi transporter nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  logger: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email diperlukan' },
        { status: 400 }
      );
    }

    // Cari admin berdasarkan email
    const admins = await executeQuery<any[]>(
      'SELECT id, username, email, nama_lengkap FROM admin WHERE email = ? LIMIT 1',
      [email]
    );
    
    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email tidak terdaftar dalam sistem' },
        { status: 404 }
      );
    }

    const admin = admins[0];
    
    // Generate token reset password
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hapus token reset password lama jika ada
    await executeQuery(
      'DELETE FROM password_resets WHERE admin_id = ?',
      [admin.id]
    );

    // Simpan token reset password baru dengan expires_at 1 jam dari sekarang menggunakan SQL
    await executeQuery(
      'INSERT INTO password_resets (admin_id, token, expires_at, used_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NULL, NOW())',
      [admin.id, resetToken]
    );

    // Kirim email dengan link reset password
    // Gunakan NEXT_PUBLIC_APP_URL untuk reset password (bisa admin atau guest URL tergantung konfigurasi)
    const resetBaseUrl = getFullUrl(`/reset-password-page?token=${resetToken}`, request);
    
    // Override dengan NEXT_PUBLIC_APP_URL jika ada, fallback ke detected URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const resetUrl = appUrl ? `${appUrl}/reset-password-page?token=${resetToken}` : resetBaseUrl;
    
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@sistem-buku-tamu.com',
      to: email,
      subject: 'Reset Password - Sistem Buku Tamu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Sistem Buku Tamu</h1>
            <p style="color: #6b7280; margin: 5px 0;">Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Password</h2>
          
          <p style="color: #374151; line-height: 1.6;">Halo <strong>${admin.nama_lengkap}</strong>,</p>
          
          <p style="color: #374151; line-height: 1.6;">
            Kami menerima permintaan untuk reset password akun administrator Anda</strong>
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            Klik tombol di bawah ini untuk reset password Anda:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(to right, #3b82f6, #6366f1); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Jika tombol di atas tidak berfungsi, copy dan paste link berikut ke browser Anda:
          </p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
            ${resetUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #ef4444; font-size: 14px; line-height: 1.6;">
              <strong>Catatan Penting:</strong>
            </p>
            <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 10px 0;">
              <li>Link ini akan kedaluwarsa dalam 1 jam</li>
              <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
              <li>Untuk keamanan, jangan bagikan link ini kepada siapapun</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2025 Sistem Buku Tamu - Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Link reset password telah dikirim ke email Anda. Silakan periksa inbox atau folder spam.' 
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    
    // Pesan error yang lebih spesifik berdasarkan jenis error
    let errorMessage = 'Terjadi kesalahan saat mengirim email reset password';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Gagal autentikasi email. Silakan hubungi administrator sistem.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Gagal terhubung ke server email. Silakan coba lagi nanti.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Format email tidak valid.';
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
