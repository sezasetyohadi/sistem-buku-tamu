/**
 * API Middleware for standardized error handling and request processing
 */

import { NextRequest } from 'next/server';

import { createApiResponse, generateRequestId, ApiResponseBuilder, HttpStatus, ErrorCodes } from './api-response';
import { logger } from './logger';

/**
 * Request context interface
 */
export interface RequestContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ipAddress?: string;
  startTime: number;
  userId?: string;
  adminId?: string;
}

/**
 * API Handler type definition
 */
export type ApiHandler<T = any> = (
  request: NextRequest,
  response: ApiResponseBuilder,
  context: RequestContext,
  params?: any
) => Promise<any>;

/**
 * Create request context from NextRequest
 */
export function createRequestContext(request: NextRequest): RequestContext {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';
  
  return {
    requestId: generateRequestId(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || 'unknown',
    ipAddress,
    startTime: Date.now(),
  };
}

/**
 * Request logger middleware
 */
export function logRequest(context: RequestContext) {
  logger.info('API Request Started', {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
  });
}

/**
 * Response logger middleware
 */
export function logResponse(context: RequestContext, statusCode: number, error?: any) {
  const executionTime = Date.now() - context.startTime;
  
  const logData = {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    statusCode,
    executionTime,
    ipAddress: context.ipAddress,
  };

  if (error) {
    logger.error('API Request Failed', {
      ...logData,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } else {
    logger.info('API Request Completed', logData);
  }
}

/**
 * CORS headers middleware
 */
export function addCorsHeaders(response: Response): Response {
  // Clone the response to add headers
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return newResponse;
}

/**
 * Rate limiting check (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now();
  const key = ipAddress;
  
  const current = requestCounts.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or first request
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }
  
  current.count++;
  return true;
}

/**
 * Input validation middleware
 */
export async function validateJsonBody(request: NextRequest): Promise<any> {
  try {
    const contentType = request.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }
    
    const body = await request.json();
    return body;
  } catch (error: any) {
    throw new Error(`Invalid JSON body: ${error.message}`);
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return newResponse;
}

/**
 * Main API middleware wrapper
 */
export function withApiMiddleware(handler: ApiHandler) {
  return async (request: NextRequest, params?: any) => {
    const context = createRequestContext(request);
    const response = createApiResponse(context.requestId);
    
    // Log incoming request
    logRequest(context);
    
    try {
      // Rate limiting check
      if (!checkRateLimit(context.ipAddress!)) {
        logResponse(context, HttpStatus.TOO_MANY_REQUESTS);
        return response.rateLimited();
      }
      
      // Handle OPTIONS requests for CORS
      if (request.method === 'OPTIONS') {
        const optionsResponse = new Response(null, { status: 200 });
        return addCorsHeaders(optionsResponse);
      }
      
      // Execute the actual handler
      const result = await handler(request, response, context, params);
      
      // Log successful response
      logResponse(context, result.status || 200);
      
      // Add security and CORS headers
      let finalResponse = addSecurityHeaders(result);
      finalResponse = addCorsHeaders(finalResponse);
      
      return finalResponse;
      
    } catch (error: any) {
      // Log error response
      logResponse(context, HttpStatus.INTERNAL_SERVER_ERROR, error);
      
      // Handle validation errors
      if (error.message?.includes('Invalid JSON') || error.message?.includes('Content-Type')) {
        return response.error(
          error.message,
          HttpStatus.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR
        );
      }
      
      // Handle database errors
      if (error.code && (error.code.startsWith('ER_') || error.code.startsWith('23'))) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23000') {
          return response.error(
            'Duplicate entry found',
            HttpStatus.CONFLICT,
            ErrorCodes.DUPLICATE_ENTRY
          );
        }
        
        return response.error(
          'Database operation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCodes.DATABASE_ERROR
        );
      }
      
      // Handle validation errors (Zod-like)
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path?.join('.') || err.field || 'unknown',
          message: err.message || 'Validation error',
          code: err.code || 'invalid_input',
        }));
        
        return response.validationError('Input validation failed', validationErrors);
      }
      
      // Generic error handling
      return response.error(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
        } : undefined
      );
    }
  };
}

/**
 * Specific middleware for authenticated routes
 */
export function withAuthMiddleware(handler: ApiHandler) {
  return withApiMiddleware(async (request, response, context, params) => {
    // Basic auth check - can be enhanced with JWT validation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized('Authentication token required');
    }
    
    // TODO: Add JWT validation here
    // For now, just pass through
    context.userId = 'user_from_token'; // Would be extracted from JWT
    
    return handler(request, response, context, params);
  });
}

/**
 * Specific middleware for admin routes
 */
export function withAdminMiddleware(handler: ApiHandler) {
  return withApiMiddleware(async (request, response, context, params) => {
    // Basic admin auth check
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized('Admin authentication required');
    }
    
    // TODO: Add admin JWT validation here
    // For now, just pass through
    context.adminId = 'admin_from_token'; // Would be extracted from JWT
    
    return handler(request, response, context, params);
  });
}

export default {
  withApiMiddleware,
  withAuthMiddleware,
  withAdminMiddleware,
  createRequestContext,
  logRequest,
  logResponse,
  addCorsHeaders,
  addSecurityHeaders,
  checkRateLimit,
  validateJsonBody,
};
