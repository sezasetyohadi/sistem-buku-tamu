/**
 * API Testing Endpoint - SECURED
 * Test different response formats and error scenarios
 * Requires admin authentication for security
 */

import { NextRequest } from 'next/server';
import { withApiMiddleware, validateJsonBody } from '@/lib/api-middleware';
import { ErrorCodes, HttpStatus, createPaginationMeta } from '@/lib/api-response';
import { verifyToken } from '@/lib/jwt';

// Security middleware for testing endpoints
const withAdminAuth = (handler: Function) => {
  return withApiMiddleware(async (request: NextRequest, response: any, context: any) => {
    // Check for admin authentication
    try {
      const authHeader = request.headers.get('authorization');
      const cookieToken = request.cookies.get('admin_access_token')?.value;
      
      const token = authHeader?.replace('Bearer ', '') || cookieToken;
      
      if (!token) {
        return response.error(
          'Authentication required for diagnostic endpoints',
          HttpStatus.UNAUTHORIZED,
          ErrorCodes.UNAUTHORIZED
        );
      }

      const payload = verifyToken(token, 'admin-panel');
      
      if (!payload || payload.userType !== 'admin') {
        return response.error(
          'Admin access required for diagnostic endpoints',
          HttpStatus.FORBIDDEN,
          ErrorCodes.FORBIDDEN
        );
      }

      // Add admin info to context
      context.admin = payload;
      
      return handler(request, response, context);
      
    } catch (error) {
      return response.error(
        'Authentication verification failed',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.UNAUTHORIZED
      );
    }
  });
};

export const GET = withAdminAuth(async (request: Request, response: any, context: any) => {
  const url = new URL(request.url);
  const testType = url.searchParams.get('type') || 'success';
  
  switch (testType) {
    case 'success':
      return response.success(
        { 
          message: 'API is working correctly',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV 
        },
        'API test successful'
      );
      
    case 'created':
      return response.created(
        { 
          id: 123,
          name: 'Test Resource',
          created_at: new Date().toISOString()
        },
        'Resource created successfully'
      );
      
    case 'pagination':
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const total = 100;
      
      const paginationMeta = createPaginationMeta(page, limit, total);
      
      return response.success(
        Array.from({ length: limit }, (_, i) => ({
          id: (page - 1) * limit + i + 1,
          name: `Item ${(page - 1) * limit + i + 1}`
        })),
        'Paginated data retrieved successfully',
        HttpStatus.OK,
        { pagination: paginationMeta }
      );
      
    case 'validation_error':
      return response.validationError(
        'Test validation error',
        [
          { field: 'email', message: 'Invalid email format', code: 'invalid_email' },
          { field: 'age', message: 'Must be a positive number', code: 'invalid_number' }
        ]
      );
      
    case 'not_found':
      return response.notFound('Test Resource', 'Test resource not found');
      
    case 'unauthorized':
      return response.unauthorized('Authentication required for this test');
      
    case 'forbidden':
      return response.forbidden('Access denied for this test');
      
    case 'rate_limited':
      return response.rateLimited('Rate limit test - too many requests');
      
    case 'server_error':
      return response.error(
        'Test server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        { details: 'This is a test error' }
      );
      
    case 'database_error':
      return response.error(
        'Test database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.DATABASE_ERROR,
        { query: 'SELECT * FROM test_table', error: 'Table does not exist' }
      );
      
    default:
      return response.error(
        `Unknown test type: ${testType}`,
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
  }
});

export const POST = withApiMiddleware(async (request, response, context) => {
  const body = await validateJsonBody(request);
  
  // Test validation
  if (!body.name) {
    return response.error(
      'Name is required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      undefined,
      'name'
    );
  }
  
  if (body.email && !body.email.includes('@')) {
    return response.error(
      'Invalid email format',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
      undefined,
      'email'
    );
  }
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return response.created(
    {
      id: Math.floor(Math.random() * 1000),
      name: body.name,
      email: body.email,
      created_at: new Date().toISOString(),
      request_id: context.requestId
    },
    'Test resource created successfully'
  );
});

export const PUT = withApiMiddleware(async (request, response, context) => {
  const body = await validateJsonBody(request);
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return response.error(
      'Resource ID is required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      undefined,
      'id'
    );
  }
  
  // Simulate not found
  if (id === '999') {
    return response.notFound('Test Resource');
  }
  
  return response.success(
    {
      id: parseInt(id),
      name: body.name || 'Updated Resource',
      updated_at: new Date().toISOString(),
      request_id: context.requestId
    },
    'Test resource updated successfully'
  );
});

export const DELETE = withApiMiddleware(async (request, response, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return response.error(
      'Resource ID is required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      undefined,
      'id'
    );
  }
  
  // Simulate not found
  if (id === '999') {
    return response.notFound('Test Resource');
  }
  
  // Simulate forbidden
  if (id === '1') {
    return response.forbidden('Cannot delete this protected resource');
  }
  
  return response.noContent('Test resource deleted successfully');
});
