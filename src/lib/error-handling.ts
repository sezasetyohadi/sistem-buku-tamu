/**
 * Comprehensive Error Handling System
 * Provides standardized error management with proper logging and user-friendly messages
 */

import { NextRequest, NextResponse } from 'next/server';

// Error Types Enum
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  DATABASE = 'DATABASE_ERROR',
  NETWORK = 'NETWORK_ERROR',
  FILE_UPLOAD = 'FILE_UPLOAD_ERROR',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC_ERROR',
  SYSTEM = 'SYSTEM_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR'
}

// Severity Levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Custom Error Classes
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    userMessage?: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    requestId?: string
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.userMessage = userMessage || this.getDefaultUserMessage(type);
    this.isOperational = true;
    this.context = context;
    this.timestamp = new Date();
    this.requestId = requestId;

    Error.captureStackTrace(this, this.constructor);
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages = {
      [ErrorType.VALIDATION]: 'Data yang Anda masukkan tidak valid.',
      [ErrorType.AUTHENTICATION]: 'Kredensial login tidak valid.',
      [ErrorType.AUTHORIZATION]: 'Anda tidak memiliki akses untuk operasi ini.',
      [ErrorType.DATABASE]: 'Terjadi kesalahan pada sistem database.',
      [ErrorType.NETWORK]: 'Terjadi kesalahan koneksi jaringan.',
      [ErrorType.FILE_UPLOAD]: 'Gagal mengunggah file.',
      [ErrorType.BUSINESS_LOGIC]: 'Operasi tidak dapat dilakukan.',
      [ErrorType.SYSTEM]: 'Terjadi kesalahan sistem.',
      [ErrorType.NOT_FOUND]: 'Data yang diminta tidak ditemukan.',
      [ErrorType.RATE_LIMIT]: 'Terlalu banyak permintaan, silakan coba lagi nanti.'
    };
    return messages[type] || 'Terjadi kesalahan yang tidak diketahui.';
  }
}

// Specific Error Classes
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>, requestId?: string) {
    super(
      message,
      ErrorType.VALIDATION,
      400,
      'Data yang Anda masukkan tidak valid. Silakan periksa kembali.',
      ErrorSeverity.LOW,
      context,
      requestId
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', requestId?: string) {
    super(
      message,
      ErrorType.AUTHENTICATION,
      401,
      'Kredensial login tidak valid atau sesi telah berakhir.',
      ErrorSeverity.MEDIUM,
      undefined,
      requestId
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', requestId?: string) {
    super(
      message,
      ErrorType.AUTHORIZATION,
      403,
      'Anda tidak memiliki akses untuk melakukan operasi ini.',
      ErrorSeverity.MEDIUM,
      undefined,
      requestId
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>, requestId?: string) {
    super(
      message,
      ErrorType.DATABASE,
      500,
      'Terjadi kesalahan pada sistem database. Silakan coba lagi.',
      ErrorSeverity.HIGH,
      context,
      requestId
    );
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', requestId?: string) {
    super(
      `${resource} not found`,
      ErrorType.NOT_FOUND,
      404,
      `${resource} yang diminta tidak ditemukan.`,
      ErrorSeverity.LOW,
      { resource },
      requestId
    );
  }
}

// Error Logger
export class ErrorLogger {
  private static formatError(error: AppError | Error, request?: NextRequest): string {
    const timestamp = new Date().toISOString();
    const isAppError = error instanceof AppError;
    
    const logData = {
      timestamp,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(isAppError && {
          type: error.type,
          severity: error.severity,
          statusCode: error.statusCode,
          userMessage: error.userMessage,
          context: error.context,
          requestId: error.requestId
        })
      },
      ...(request && {
        request: {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get('user-agent'),
          ip: this.getClientIP(request)
        }
      })
    };

    return JSON.stringify(logData, null, 2);
  }

  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    return 'unknown';
  }

  public static logError(error: AppError | Error, request?: NextRequest): void {
    const formattedError = this.formatError(error, request);
    
    if (error instanceof AppError) {
      switch (error.severity) {
        case ErrorSeverity.LOW:
          console.warn('[WARN]', formattedError);
          break;
        case ErrorSeverity.MEDIUM:
          console.error('[ERROR]', formattedError);
          break;
        case ErrorSeverity.HIGH:
        case ErrorSeverity.CRITICAL:
          console.error('[CRITICAL]', formattedError);
          break;
      }
    } else {
      console.error('[UNHANDLED]', formattedError);
    }
  }
}

// Error Response Builder
export class ErrorResponseBuilder {
  public static buildErrorResponse(
    error: AppError | Error,
    request?: NextRequest
  ): NextResponse {
    // Log the error
    ErrorLogger.logError(error, request);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: error.type,
            message: error.userMessage,
            code: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && {
              details: error.message,
              stack: error.stack
            })
          },
          timestamp: error.timestamp.toISOString(),
          ...(error.requestId && { requestId: error.requestId })
        },
        { status: error.statusCode }
      );
    }

    // Handle unknown errors
    const statusCode = 500;
    const userMessage = 'Terjadi kesalahan sistem yang tidak terduga.';
    
    return NextResponse.json(
      {
        success: false,
        error: {
          type: ErrorType.SYSTEM,
          message: userMessage,
          code: statusCode,
          ...(process.env.NODE_ENV === 'development' && {
            details: error.message,
            stack: error.stack
          })
        },
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// Global Error Handler for API Routes
export function withErrorHandler(
  handler: (request: NextRequest, params?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, params?: any): Promise<NextResponse> => {
    try {
      return await handler(request, params);
    } catch (error) {
      return ErrorResponseBuilder.buildErrorResponse(
        error instanceof Error ? error : new Error(String(error)),
        request
      );
    }
  };
}

// Async Error Handler
export function catchAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      ErrorLogger.logError(error);
      throw error;
    });
  };
}

// Validation Helper
export function validateRequired(
  data: Record<string, any>,
  fields: string[],
  requestId?: string
): void {
  const missing = fields.filter(field => 
    data[field] === undefined || 
    data[field] === null || 
    data[field] === ''
  );

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing, providedData: Object.keys(data) },
      requestId
    );
  }
}

// Database Error Handler
export function handleDatabaseError(error: any, operation: string, requestId?: string): never {
  let message = `Database ${operation} failed`;
  const context: Record<string, any> = { operation };

  if (error.code) {
    context.errorCode = error.code;
    
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        message = 'Duplicate entry detected';
        context.type = 'duplicate';
        break;
      case 'ER_NO_REFERENCED_ROW_2':
        message = 'Referenced data not found';
        context.type = 'foreign_key';
        break;
      case 'ER_ROW_IS_REFERENCED_2':
        message = 'Cannot delete: data is referenced by other records';
        context.type = 'foreign_key_constraint';
        break;
      default:
        context.type = 'unknown';
    }
  }

  if (error.sqlMessage) {
    context.sqlMessage = error.sqlMessage;
  }

  throw new DatabaseError(message, context, requestId);
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  ErrorLogger,
  ErrorResponseBuilder,
  withErrorHandler,
  catchAsync,
  validateRequired,
  handleDatabaseError,
  ErrorType,
  ErrorSeverity
};
