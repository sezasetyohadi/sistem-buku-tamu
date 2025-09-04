import { NextRequest, NextResponse } from 'next/server';
import { findByUsername, validatePassword } from '../../../../backend/services/adminService';
import { LoginSecurityService } from '../../../../backend/services/loginSecurityService';
import { getConnection } from '../../../../backend/config/db';
import { generateAdminTokens } from '../../../../lib/jwt';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { username, password, rememberMe } = await request.json();

    // Get client info for security tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username dan password harus diisi'
      }, { status: 400 });
    }

    // Connect to database
    connection = await getConnection();
    const securityService = new LoginSecurityService(connection);

    // Check if login is allowed (rate limiting/account locks)
    let securityStatus;
    try {
      securityStatus = await securityService.checkLoginPermission(username, ipAddress);
    } catch (error: any) {
      // Log the blocked attempt
      await securityService.recordLoginAttempt({
        username,
        ipAddress,
        userAgent,
        success: false,
        failureReason: error.message
      });
      
      return NextResponse.json({
        success: false,
        message: error.message,
        blocked: true
      }, { status: 429 });
    }

    // Check if account is locked
    if (securityStatus.isLocked) {
      await securityService.recordLoginAttempt({
        username,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Account locked'
      });

      const lockExpiresIn = securityStatus.lockoutExpiresAt 
        ? Math.ceil((securityStatus.lockoutExpiresAt.getTime() - Date.now()) / 60000)
        : 0;

      return NextResponse.json({
        success: false,
        message: `Account temporarily locked. Try again in ${lockExpiresIn} minutes.`,
        locked: true,
        lockExpiresIn
      }, { status: 423 });
    }

    // Apply progressive delay if needed
    if (securityStatus.nextAttemptDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, securityStatus.nextAttemptDelay * 1000));
    }

    // Find admin by username
    const admin = await findByUsername(username);
    
    if (!admin) {
      // Record failed attempt
      await securityService.recordLoginAttempt({
        username,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Invalid username'
      });

      return NextResponse.json({
        success: false,
        message: 'Username atau password tidak valid'
      }, { status: 401 });
    }

    // Validate password
    const isValidPassword = await validatePassword(password, admin.password);
    
    if (!isValidPassword) {
      // Record failed attempt
      await securityService.recordLoginAttempt({
        username,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Invalid password'
      });

      return NextResponse.json({
        success: false,
        message: 'Username atau password tidak valid'
      }, { status: 401 });
    }

    // Login successful - record successful attempt
    await securityService.recordLoginAttempt({
      username,
      ipAddress,
      userAgent,
      success: true
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateAdminTokens({
      userId: admin.id,
      username: admin.username,
      email: admin.email,
      nama_lengkap: admin.nama_lengkap,
      is_super_admin: admin.is_super_admin
    });

    // Create response with admin data (without password)
    const { password: _, ...adminData } = admin;
    
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      admin: adminData
    });

    // Set secure httpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const accessTokenMaxAge = 24 * 60 * 60; // 24 hours in seconds
    const refreshTokenMaxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 24 hours

    // Set access token cookie
    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: accessTokenMaxAge,
      path: '/'
    });

    // Set refresh token cookie
    response.cookies.set('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    }, { status: 500 });
  } finally {
    // Release database connection
    if (connection) {
      connection.release();
    }
  }
}
