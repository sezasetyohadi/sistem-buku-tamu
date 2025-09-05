/**
 * Server-side Validation Utilities
 * For validating API requests and responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  ValidationSchema, 
  validateSchema, 
  ValidationResult 
} from './validation';
import { apiLogger } from './logger';

// API validation result interface
export interface ApiValidationResult {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
  message?: string;
}

/**
 * Validate request body against a schema
 */
export async function validateRequestBody(
  request: NextRequest,
  schema: ValidationSchema
): Promise<{ isValid: boolean; data?: any; errors?: Record<string, string> }> {
  try {
    const body = await request.json();
    const result = validateSchema(body, schema);
    
    apiLogger.debug('Request body validation:', {
      isValid: result.isValid,
      errorCount: Object.keys(result.errors).length
    });
    
    return {
      isValid: result.isValid,
      data: result.isValid ? body : undefined,
      errors: result.isValid ? undefined : result.errors
    };
  } catch (error) {
    apiLogger.error('Error parsing request body for validation:', error);
    return {
      isValid: false,
      errors: { body: 'Invalid JSON format' }
    };
  }
}

/**
 * Validate query parameters against a schema
 */
export function validateQueryParams(
  request: NextRequest,
  schema: ValidationSchema
): { isValid: boolean; data?: any; errors?: Record<string, string> } {
  try {
    const url = new URL(request.url);
    const params: Record<string, any> = {};
    
    // Convert URLSearchParams to object
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    const result = validateSchema(params, schema);
    
    apiLogger.debug('Query params validation:', {
      isValid: result.isValid,
      errorCount: Object.keys(result.errors).length
    });
    
    return {
      isValid: result.isValid,
      data: result.isValid ? params : undefined,
      errors: result.isValid ? undefined : result.errors
    };
  } catch (error) {
    apiLogger.error('Error validating query parameters:', error);
    return {
      isValid: false,
      errors: { query: 'Invalid query parameters' }
    };
  }
}

/**
 * Create validation middleware for API routes
 */
export function createValidationMiddleware(
  bodySchema?: ValidationSchema,
  querySchema?: ValidationSchema
) {
  return async (request: NextRequest): Promise<NextResponse | { data: any }> => {
    const validationErrors: Record<string, string> = {};
    let requestData: any = {};

    // Validate request body if schema provided
    if (bodySchema && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
      const bodyValidation = await validateRequestBody(request, bodySchema);
      if (!bodyValidation.isValid) {
        Object.assign(validationErrors, bodyValidation.errors);
      } else {
        requestData = { ...requestData, ...bodyValidation.data };
      }
    }

    // Validate query parameters if schema provided
    if (querySchema && request.method === 'GET') {
      const queryValidation = validateQueryParams(request, querySchema);
      if (!queryValidation.isValid) {
        Object.assign(validationErrors, queryValidation.errors);
      } else {
        requestData = { ...requestData, query: queryValidation.data };
      }
    }

    // Return error response if validation failed
    if (Object.keys(validationErrors).length > 0) {
      apiLogger.warn('API validation failed:', validationErrors);
      
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }

    // Return validated data for successful validation
    return { data: requestData };
  };
}

/**
 * Sanitize input data to prevent XSS and injection attacks
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Create standardized API response
 */
export function createApiResponse(
  data: any = null,
  message: string = '',
  success: boolean = true,
  status: number = 200
): NextResponse {
  const response = {
    success,
    message,
    data: success ? data : null,
    timestamp: new Date().toISOString()
  };

  apiLogger.info(`API Response [${status}]:`, {
    success,
    message,
    hasData: !!data
  });

  return NextResponse.json(response, { status });
}

/**
 * Create error API response
 */
export function createErrorResponse(
  message: string,
  errors?: Record<string, string>,
  status: number = 400
): NextResponse {
  const response = {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  };

  apiLogger.error(`API Error [${status}]:`, {
    message,
    errors
  });

  return NextResponse.json(response, { status });
}

/**
 * Validate and sanitize API input
 */
export async function validateAndSanitizeInput(
  request: NextRequest,
  schema: ValidationSchema
): Promise<{ success: boolean; data?: any; response?: NextResponse }> {
  try {
    // Validate the input
    const validation = await validateRequestBody(request, schema);
    
    if (!validation.isValid) {
      return {
        success: false,
        response: createErrorResponse('Validation failed', validation.errors)
      };
    }

    // Sanitize the validated data
    const sanitizedData = sanitizeInput(validation.data);

    return {
      success: true,
      data: sanitizedData
    };
  } catch (error) {
    apiLogger.error('Error in validate and sanitize:', error);
    return {
      success: false,
      response: createErrorResponse('Internal server error', undefined, 500)
    };
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, data] of rateLimitMap.entries()) {
    if (data.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(identifier);
  
  if (!current) {
    // First request
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  if (current.resetTime < now) {
    // Window has reset
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  // Within current window
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  current.count++;
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  };
}

/**
 * Apply rate limiting to API route
 */
export function withRateLimit(
  maxRequests: number = 10,
  windowMs: number = 60000
) {
  return (request: NextRequest): NextResponse | null => {
    // Use IP address or user identifier for rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      request.headers.get('cf-connecting-ip') ||
                      'anonymous';
    
    const rateLimit = checkRateLimit(identifier, maxRequests, windowMs);
    
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
        }
      });
    }
    
    return null; // Continue to next middleware/handler
  };
}
