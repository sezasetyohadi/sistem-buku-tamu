import { NextRequest } from 'next/server';
import { findByUsername, validatePassword } from '../../../../backend/services/adminService';
import { LoginSecurityService } from '../../../../backend/services/loginSecurityService';
import { getConnection } from '../../../../backend/config/db';
import { generateAdminTokens } from '../../../../lib/jwt';
import { withApiMiddleware, validateJsonBody } from '@/lib/api-middleware';
import { ErrorCodes, HttpStatus } from '@/lib/api-response';
import { 
  validateAndSanitize,
  ADMIN_LOGIN_SCHEMA,
  SANITIZATION_CONFIGS
} from '@/lib/validation';
import { apiLogger } from '@/lib/logger';

export const POST = withApiMiddleware(async (request, apiResponse, context) => {
  let connection;
  
  try {
    const body = await validateJsonBody(request);

    // Validate and sanitize input data
    const validation = validateAndSanitize(
      body,
      ADMIN_LOGIN_SCHEMA,
      SANITIZATION_CONFIGS.ADMIN_LOGIN
    );

    if (!validation.isValid) {
      apiLogger.warn('Admin login validation failed', {
        operation: 'POST_ADMIN_LOGIN_VALIDATION_ERROR',
        metadata: {
          errors: validation.errors,
          firstError: validation.firstError,
          ipAddress: context.ipAddress
        }
      });

      return apiResponse.error(
        validation.firstError || 'Data login tidak valid',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        validation.errors
      );
    }

    const { username, password } = validation.data;
    const rememberMe = body.rememberMe; // This field is not validated as it's optional

    // Get client info for security tracking
    const ipAddress = context.ipAddress;
    const userAgent = context.userAgent;

    // Connect to database
    connection = await getConnection();
    const securityService = new LoginSecurityService(connection);

    apiLogger.info('Admin login attempt', {
      operation: 'POST_ADMIN_LOGIN_ATTEMPT',
      metadata: {
        username: username,
        ipAddress: ipAddress,
        userAgent: userAgent,
        rememberMe: !!rememberMe
      }
    });

    // Check if login is allowed (rate limiting/account locks)
    let securityStatus;
    try {
      securityStatus = await securityService.checkLoginPermission(username, ipAddress!);
    } catch (error: any) {
      // Log the blocked attempt
      await securityService.recordLoginAttempt({
        username,
        ipAddress: ipAddress!,
        userAgent: userAgent!,
        success: false,
        failureReason: error.message
      });

      apiLogger.warn('Admin login blocked by security service', {
        operation: 'POST_ADMIN_LOGIN_BLOCKED',
        metadata: {
          username,
          ipAddress,
          reason: error.message
        }
      });
      
      return apiResponse.error(
        error.message,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        { blocked: true }
      );
    }

    // Check if account is locked
    if (securityStatus.isLocked) {
      await securityService.recordLoginAttempt({
        username,
        ipAddress: ipAddress!,
        userAgent: userAgent!,
        success: false,
        failureReason: 'Account locked'
      });

      const lockExpiresIn = securityStatus.lockoutExpiresAt 
        ? Math.ceil((securityStatus.lockoutExpiresAt.getTime() - Date.now()) / 60000)
        : 0;

      return apiResponse.error(
        `Account temporarily locked. Try again in ${lockExpiresIn} minutes.`,
        HttpStatus.FORBIDDEN,
        ErrorCodes.FORBIDDEN,
        { locked: true, lockExpiresIn }
      );
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
        ipAddress: ipAddress!,
        userAgent: userAgent!,
        success: false,
        failureReason: 'Invalid username'
      });

      return apiResponse.error(
        'Username atau password tidak valid',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS
      );
    }

    // Validate password
    const isValidPassword = await validatePassword(password, admin.password);
        
    if (!isValidPassword) {
      // Record failed attempt
      await securityService.recordLoginAttempt({
        username,
        ipAddress: ipAddress!,
        userAgent: userAgent!,
        success: false,
        failureReason: 'Invalid password'
      });

      return apiResponse.error(
        'Username atau password tidak valid',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS
      );
    }

    // Login successful - record successful attempt
    await securityService.recordLoginAttempt({
      username,
      ipAddress: ipAddress!,
      userAgent: userAgent!,
      success: true
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateAdminTokens({
      userId: admin.id,
      username: admin.username,
      email: admin.email || '',
      nama_lengkap: admin.nama_lengkap || '',
      is_super_admin: admin.is_super_admin || false
    });

    // Create response with admin data (without password)
    const { password: _, ...adminData } = admin;
    
    const response = apiResponse.success(
      adminData,
      'Login berhasil'
    );

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

  } finally {
    // Release database connection
    if (connection) {
      connection.release();
    }
  }
});
