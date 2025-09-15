/**
 * Standardized API Response System
 * Provides consistent response formats, error handling, and status codes
 */

import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

/**
 * Standard HTTP Status Codes
 */
export const HttpStatus = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  timestamp: string;
  requestId?: string;
}

/**
 * API Error Interface
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  stack?: string;
}

/**
 * API Metadata Interface (for pagination, etc.)
 */
export interface ApiMeta {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  sorting?: {
    sortBy: string;
    order: 'asc' | 'desc';
  };
  filters?: Record<string, any>;
  performance?: {
    executionTime: number;
    queryCount?: number;
  };
}

/**
 * Standard Error Codes
 */
export const ErrorCodes = {
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Database Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  FOREIGN_KEY_CONSTRAINT: 'FOREIGN_KEY_CONSTRAINT',
  
  // Business Logic Errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  
  // System Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // External Service Errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

/**
 * Response Builder Class
 */
export class ApiResponseBuilder {
  private requestId?: string;
  private startTime: number;

  constructor(requestId?: string) {
    this.requestId = requestId;
    this.startTime = Date.now();
  }

  /**
   * Success Response
   */
  success<T>(
    data: T,
    message = 'Operation completed successfully',
    statusCode: number = HttpStatus.OK,
    meta?: ApiMeta
  ): NextResponse<ApiResponse<T>> {
    const executionTime = Date.now() - this.startTime;
    
    // Add performance metadata
    const finalMeta: ApiMeta = {
      ...meta,
      performance: {
        executionTime,
        ...meta?.performance,
      },
    };

    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta: finalMeta,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
    };

    // Log successful operation
    logger.info('API Success Response', {
      requestId: this.requestId,
      statusCode,
      executionTime,
      dataType: typeof data,
      message,
    });

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Error Response
   */
  error(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: string = ErrorCodes.INTERNAL_ERROR,
    details?: any,
    field?: string
  ): NextResponse<ApiResponse> {
    const executionTime = Date.now() - this.startTime;
    
    const error: ApiError = {
      code: errorCode,
      message,
      details,
      field,
      ...(process.env.NODE_ENV === 'development' && details?.stack && { stack: details.stack }),
    };

    const response: ApiResponse = {
      success: false,
      message,
      error,
      meta: {
        performance: {
          executionTime,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
    };

    // Log error with appropriate level
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel]('API Error Response', {
      requestId: this.requestId,
      statusCode,
      errorCode,
      executionTime,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    });

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Validation Error Response
   */
  validationError(
    message = 'Validation failed',
    errors: Array<{ field: string; message: string; code?: string }> = []
  ): NextResponse<ApiResponse> {
    return this.error(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCodes.VALIDATION_ERROR,
      { errors }
    );
  }

  /**
   * Not Found Response
   */
  notFound(
    resource = 'Resource',
    message?: string
  ): NextResponse<ApiResponse> {
    return this.error(
      message || `${resource} not found`,
      HttpStatus.NOT_FOUND,
      ErrorCodes.RECORD_NOT_FOUND
    );
  }

  /**
   * Unauthorized Response
   */
  unauthorized(
    message = 'Authentication required'
  ): NextResponse<ApiResponse> {
    return this.error(
      message,
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  /**
   * Forbidden Response
   */
  forbidden(
    message = 'Access denied'
  ): NextResponse<ApiResponse> {
    return this.error(
      message,
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  /**
   * Rate Limited Response
   */
  rateLimited(
    message = 'Too many requests'
  ): NextResponse<ApiResponse> {
    return this.error(
      message,
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }

  /**
   * Created Response
   */
  created<T>(
    data: T,
    message = 'Resource created successfully'
  ): NextResponse<ApiResponse<T>> {
    return this.success(data, message, HttpStatus.CREATED);
  }

  /**
   * No Content Response
   */
  noContent(
    message = 'Operation completed successfully'
  ): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
    };

    return NextResponse.json(response, { status: HttpStatus.NO_CONTENT });
  }
}

/**
 * Utility Functions
 */

/**
 * Create a standardized API response builder
 */
export function createApiResponse(requestId?: string): ApiResponseBuilder {
  return new ApiResponseBuilder(requestId);
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Handle Zod validation errors (if Zod is available)
 */
export function handleZodError(error: any, response: ApiResponseBuilder) {
  // Handle Zod validation errors
  const errors = error.errors?.map((err: any) => ({
    field: err.path?.join('.') || '',
    message: err.message || 'Validation error',
    code: err.code || 'invalid_input',
  })) || [];

  return response.validationError('Input validation failed', errors);
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any, response: ApiResponseBuilder) {
  // Check for common database error patterns
  if (error.code === 'ER_DUP_ENTRY' || error.code === '23000') {
    return response.error(
      'Duplicate entry found',
      HttpStatus.CONFLICT,
      ErrorCodes.DUPLICATE_ENTRY,
      error.message
    );
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '23503') {
    return response.error(
      'Referenced record not found',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.FOREIGN_KEY_CONSTRAINT,
      error.message
    );
  }

  // Generic database error
  return response.error(
    'Database operation failed',
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCodes.DATABASE_ERROR,
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}

/**
 * Pagination helper
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): ApiMeta['pagination'] {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * HOF for wrapping API handlers with standard error handling
 */
export function withApiErrorHandling(
  handler: (
    request: Request,
    response: ApiResponseBuilder,
    params?: any
  ) => Promise<NextResponse>
) {
  return async (request: Request, params?: any): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const response = createApiResponse(requestId);

    try {
      return await handler(request, response, params);
    } catch (error: any) {
      // Handle specific error types
      if (error.errors && Array.isArray(error.errors)) {
        // Likely a Zod validation error
        return handleZodError(error, response);
      }

      // Handle database errors
      if (error.code && (error.code.startsWith('ER_') || error.code.startsWith('23'))) {
        return handleDatabaseError(error, response);
      }

      // Generic error handling
      return response.error(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  };
}

export default {
  HttpStatus,
  ErrorCodes,
  ApiResponseBuilder,
  createApiResponse,
  generateRequestId,
  handleZodError,
  handleDatabaseError,
  createPaginationMeta,
  withApiErrorHandling,
};
