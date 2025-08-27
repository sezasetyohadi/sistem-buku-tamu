import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Dummy database untuk menyimpan token dan email
const tokenDatabase: Record<string, string> = {
  'ABC123': 'user1@example.com',
  'XYZ789': 'user2@example.com',
};

// Reverse lookup untuk mencari token berdasarkan email
const getTokenByEmail = (email: string): string | null => {
  for (const [token, tokenEmail] of Object.entries(tokenDatabase)) {
    if (tokenEmail === email) {
      return token;
    }
  }
  return null;
};

// Konfigurasi transporter nodemailer
// Catatan: Untuk produksi, gunakan variabel lingkungan untuk kredensial
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
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
    const token = getTokenByEmail(email);
    
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
  } catch (error) {
    console.error('Error sending token:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim token' },
      { status: 500 }
    );
  }
}