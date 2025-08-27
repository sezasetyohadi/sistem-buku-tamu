import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { executeQuery } from '@/backend/config/db';

// Fungsi untuk mencari token berdasarkan email
const getTokenByEmail = async (email: string): Promise<string | null> => {
  try {
    // Cari tamu berdasarkan email
    const guests = await executeQuery<any[]>(
      `SELECT dt.id, dt.email FROM daftar_tamu dt WHERE dt.email = ? LIMIT 1`,
      [email]
    );
    
    if (!guests || guests.length === 0) {
      return null;
    }
    
    const tamuId = guests[0].id;
    
    // Cari token aktif untuk tamu tersebut
    const tokens = await executeQuery<any[]>(
      `SELECT token FROM tamu_token WHERE tamu_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1`,
      [tamuId]
    );
    
    if (!tokens || tokens.length === 0) {
      return null;
    }
    
    return tokens[0].token;
  } catch (error) {
    console.error('Error getting token by email:', error);
    return null;
  }
};

// Konfigurasi transporter nodemailer
// Catatan: Untuk produksi, gunakan variabel lingkungan untuk kredensial
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Tambahkan opsi debug untuk membantu troubleshooting
  logger: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    // Cari token berdasarkan email
    const token = await getTokenByEmail(email);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Email tidak ditemukan dalam sistem' },
        { status: 404 }
      );
    }

    // Kirim email dengan token
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Token Pengajuan Anda',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Token Pengajuan Anda</h2>
          <p>Berikut adalah token pengajuan yang Anda minta:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 2px; font-weight: bold;">
            ${token}
          </div>
          <p style="margin-top: 20px;">Gunakan token ini untuk memeriksa status pengajuan Anda.</p>
          <p>Terima kasih.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: 'Token telah dikirim ke email Anda' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending token:', error);
    
    // Pesan error yang lebih spesifik berdasarkan jenis error
    let errorMessage = 'Terjadi kesalahan saat mengirim token';
    let statusCode = 500;
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Gagal autentikasi email. Silakan periksa konfigurasi SMTP di server.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Gagal terhubung ke server email. Silakan periksa koneksi internet atau konfigurasi SMTP.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Alamat email tidak valid. Silakan periksa alamat email tujuan.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}