import { NextRequest, NextResponse } from 'next/server';
import { generateGuestTokens } from '../../../../lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { guestId, nama_lengkap, email, nomor_telp } = await request.json();

    // Validate input
    if (!guestId || !nama_lengkap || !email) {
      return NextResponse.json({
        success: false,
        message: 'Data guest tidak lengkap'
      }, { status: 400 });
    }

    // Generate JWT tokens for guest
    const { accessToken, refreshToken } = generateGuestTokens({
      guestId,
      nama_lengkap,
      email,
      nomor_telp: nomor_telp || ''
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Guest token berhasil dibuat',
      guest: {
        guestId,
        nama_lengkap,
        email,
        nomor_telp
      }
    });

    // Set secure httpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const accessTokenMaxAge = 24 * 60 * 60; // 24 hours in seconds
    const refreshTokenMaxAge = 7 * 24 * 60 * 60; // 7 days

    // Set access token cookie
    response.cookies.set('guest_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    });

    // Set refresh token cookie
    response.cookies.set('guest_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat login guest'
    }, { status: 500 });
  }
}
