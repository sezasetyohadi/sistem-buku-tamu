# API Response Standards Documentation

This document outlines the standardized response formats for all API endpoints in the Guest Book System.

## Response Format

All API responses follow a consistent structure:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  timestamp: string;
  requestId?: string;
}
```

## Success Response Examples

### GET /api/guests
```json
{
  "success": true,
  "message": "Guests retrieved successfully",
  "data": [
    {
      "id": 1,
      "nama": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-09-05T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "performance": {
      "executionTime": 45
    }
  },
  "timestamp": "2025-09-05T10:00:00.123Z",
  "requestId": "req_1725530400123_abc123def"
}
```

### POST /api/guests
```json
{
  "success": true,
  "message": "Tamu berhasil terdaftar",
  "data": {
    "id": 123,
    "nama": "Jane Smith",
    "email": "jane@example.com",
    "token": {
      "id": 456,
      "token": "guest_token_xyz789",
      "is_active": true,
      "created_at": "2025-09-05T10:00:00Z"
    }
  },
  "meta": {
    "performance": {
      "executionTime": 123
    }
  },
  "timestamp": "2025-09-05T10:00:00.123Z",
  "requestId": "req_1725530400123_def456ghi"
}
```

## Error Response Examples

### Validation Error (400)
```json
{
  "success": false,
  "message": "Input validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format",
          "code": "invalid_email"
        },
        {
          "field": "nama",
          "message": "Name is required",
          "code": "required"
        }
      ]
    }
  },
  "meta": {
    "performance": {
      "executionTime": 12
    }
  },
  "timestamp": "2025-09-05T10:00:00.123Z",
  "requestId": "req_1725530400123_ghi789jkl"
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "meta": {
    "performance": {
      "executionTime": 8
    }
  },
  "timestamp": "2025-09-05T10:00:00.123Z",
  "requestId": "req_1725530400123_jkl012mno"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "message": "Too many requests",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "blocked": true
    }
  },
  "meta": {
    "performance": {
      "executionTime": 5
    }
  },
  "timestamp": "2025-09-05T10:00:00.123Z",
  "requestId": "req_1725530400123_mno345pqr"
}
```

### Database Error (500)
```json
{
  "success": false,
  "message": "Database operation failed",
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database operation failed"
  },
  "meta": {
    "performance": {
      "executionTime": 67
    }
  },
  "timestamp": "2025-09-05T10:00:00.123Z",
  "requestId": "req_1725530400123_pqr678stu"
}
```

## HTTP Status Codes

### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `202 Accepted` - Request accepted for processing
- `204 No Content` - Request successful, no content to return

### Client Error Codes
- `400 Bad Request` - Invalid request format or missing required fields
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported
- `409 Conflict` - Resource conflict (duplicate entry)
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded

### Server Error Codes
- `500 Internal Server Error` - Generic server error
- `501 Not Implemented` - Feature not implemented
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Service temporarily unavailable
- `504 Gateway Timeout` - Upstream service timeout

## Error Codes

### Validation Errors
- `VALIDATION_ERROR` - General validation failure
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_FORMAT` - Invalid data format

### Authentication Errors
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `TOKEN_EXPIRED` - Authentication token expired
- `INVALID_CREDENTIALS` - Invalid username/password

### Database Errors
- `DATABASE_ERROR` - Generic database error
- `RECORD_NOT_FOUND` - Requested record not found
- `DUPLICATE_ENTRY` - Duplicate record violation
- `FOREIGN_KEY_CONSTRAINT` - Foreign key constraint violation

### Business Logic Errors
- `BUSINESS_RULE_VIOLATION` - Business rule violation
- `INSUFFICIENT_PERMISSIONS` - Insufficient permissions
- `OPERATION_NOT_ALLOWED` - Operation not allowed in current state

### System Errors
- `INTERNAL_ERROR` - Internal server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `EXTERNAL_SERVICE_ERROR` - External service error
- `TIMEOUT_ERROR` - Operation timeout

## Pagination

For endpoints that return lists, pagination metadata is included:

```typescript
interface PaginationMeta {
  page: number;          // Current page number (1-based)
  limit: number;         // Items per page
  total: number;         // Total number of items
  totalPages: number;    // Total number of pages
  hasNext: boolean;      // Whether there is a next page
  hasPrev: boolean;      // Whether there is a previous page
}
```

## Performance Metadata

All responses include performance information:

```typescript
interface PerformanceMeta {
  executionTime: number;    // Execution time in milliseconds
  queryCount?: number;      // Number of database queries (optional)
}
```

## Request IDs

Each request is assigned a unique request ID for tracking and debugging purposes. The format is:
```
req_{timestamp}_{random_string}
```

Example: `req_1725530400123_abc123def456`

## CORS Headers

All API responses include appropriate CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Rate Limiting

Basic rate limiting is implemented:
- **Limit**: 100 requests per minute per IP address
- **Window**: 60 seconds
- **Response**: HTTP 429 with `RATE_LIMIT_EXCEEDED` error code

## Logging

All API requests and responses are logged with structured logging:

### Request Logs
```json
{
  "level": "info",
  "message": "API Request Started",
  "requestId": "req_1725530400123_abc123def",
  "method": "POST",
  "url": "/api/guests",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.100",
  "timestamp": "2025-09-05T10:00:00.123Z"
}
```

### Response Logs
```json
{
  "level": "info",
  "message": "API Request Completed",
  "requestId": "req_1725530400123_abc123def",
  "method": "POST",
  "url": "/api/guests",
  "statusCode": 201,
  "executionTime": 123,
  "ipAddress": "192.168.1.100",
  "timestamp": "2025-09-05T10:00:00.246Z"
}
```

## Migration Guide

### Before (Old Format)
```json
{
  "success": true,
  "data": [...],
  "message": "Success"
}
```

### After (New Format)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [...],
  "meta": {
    "performance": {
      "executionTime": 45
    }
  },
  "timestamp": "2025-09-05T10:00:00.123Z",
  "requestId": "req_1725530400123_abc123def"
}
```

## Usage Examples

### Using the API Response Builder

```typescript
import { withApiMiddleware } from '@/lib/api-middleware';
import { ErrorCodes, HttpStatus } from '@/lib/api-response';

export const GET = withApiMiddleware(async (request, response, context) => {
  try {
    const data = await getData();
    
    return response.success(
      data,
      'Data retrieved successfully'
    );
  } catch (error) {
    return response.error(
      'Failed to retrieve data',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR
    );
  }
});
```

### Handling Validation Errors

```typescript
export const POST = withApiMiddleware(async (request, response, context) => {
  const body = await validateJsonBody(request);
  
  if (!body.name) {
    return response.error(
      'Name is required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      undefined,
      'name'
    );
  }
  
  // Process request...
});
```

This standardized format ensures consistency across all API endpoints and provides rich information for debugging and monitoring.
