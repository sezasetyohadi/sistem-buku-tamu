# Error Handling Implementation Guide

## Overview

The error handling system provides comprehensive error management throughout the application with:
- **Structured Error Classes**: Custom error types for different scenarios
- **Global Error Handling**: Catches unhandled errors and promise rejections
- **User-Friendly Messages**: Translates technical errors into user-friendly Indonesian messages
- **Comprehensive Logging**: Detailed error logging for debugging and monitoring
- **API Error Management**: Standardized error responses across all API endpoints

## Error Types

### Custom Error Classes

```typescript
// Base error class
class AppError extends Error {
  type: ErrorType
  severity: ErrorSeverity
  statusCode: number
  userMessage: string
  context?: Record<string, any>
  requestId?: string
}

// Specific error types
class ValidationError extends AppError
class AuthenticationError extends AppError
class AuthorizationError extends AppError
class DatabaseError extends AppError
class NotFoundError extends AppError
```

### Error Severity Levels

- **LOW**: Minor issues, application continues normally
- **MEDIUM**: Significant issues that affect functionality
- **HIGH**: Major issues that impact core features
- **CRITICAL**: Severe issues that could affect system stability

## Frontend Error Handling

### Error Boundary

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Wrap components with error boundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Error State Management

```typescript
import { useErrorHandler, useFetch } from '@/hooks/useErrorHandling';

function MyComponent() {
  const { error, handleError, clearError } = useErrorHandler();
  const { fetchData, isLoading } = useFetch();

  const loadData = async () => {
    try {
      const data = await fetchData('/api/data');
      // Handle success
    } catch (error) {
      handleError(error);
    }
  };

  if (error) {
    return (
      <ErrorMessage
        message={error}
        action={{
          label: "Coba Lagi",
          onClick: () => {
            clearError();
            loadData();
          }
        }}
      />
    );
  }

  // Normal render
}
```

### Loading and Error States

```typescript
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/components/ui/loading-states';

// Loading state
if (isLoading) {
  return <LoadingSpinner message="Memuat data..." />;
}

// Error state
if (error) {
  return (
    <ErrorMessage
      message={error}
      type="error"
      action={{
        label: "Refresh",
        onClick: handleRefresh
      }}
    />
  );
}

// Empty state
if (data.length === 0) {
  return (
    <EmptyState
      title="Tidak ada data"
      description="Belum ada data yang tersedia"
      action={{
        label: "Tambah Data",
        onClick: handleAdd
      }}
    />
  );
}
```

## Backend Error Handling

### API Routes

```typescript
import { withApiMiddleware } from '@/lib/api-middleware';
import { ValidationError, DatabaseError } from '@/lib/error-handling';

export const GET = withApiMiddleware(async (request, response, context) => {
  try {
    // Validate input
    if (!someRequiredField) {
      throw new ValidationError('Field wajib diisi', { field: 'someField' });
    }

    // Database operation
    const data = await getDatabaseData();
    
    return response.success(data, 'Data berhasil diambil');
  } catch (error) {
    // Error handling is automatic with middleware
    throw error;
  }
});
```

### Database Service

```typescript
import { handleDatabaseError } from '@/lib/error-handling';
import { dbLogger } from '@/lib/logger';

export async function getUsers() {
  try {
    dbLogger.info('Fetching users');
    const users = await executeQuery('SELECT * FROM users');
    return users;
  } catch (error) {
    dbLogger.error('Failed to fetch users', {}, error);
    handleDatabaseError(error, 'getUsers');
  }
}
```

## Error Logging

### Structured Logging

```typescript
import { logger, apiLogger, dbLogger } from '@/lib/logger';

// General logging
logger.info('Application started');
logger.error('Something went wrong', { context: 'additional info' });

// API logging
apiLogger.info('Request processed', {
  operation: 'GET_USERS',
  metadata: { count: 10 }
});

// Database logging
dbLogger.debug('Query executed', {
  operation: 'SELECT_USERS',
  duration: 45
});
```

### Error Context

Always provide context when logging errors:

```typescript
logger.error('Database connection failed', {
  operation: 'CONNECT_DB',
  metadata: {
    host: 'localhost',
    database: 'myapp',
    attemptNumber: 3
  }
}, error);
```

## Environment Configuration

Add these to your `.env` file:

```bash
# Logging Configuration
LOG_LEVEL=info                    # debug, info, warn, error
NODE_ENV=development              # development, production

# Error Handling
VALIDATE_ENV=true                 # Enable environment validation
```

## Common Error Scenarios

### Network Errors

```typescript
// Client-side network error handling
const { fetchData, error, isLoading } = useFetch();

const loadData = async () => {
  try {
    await fetchData('/api/data', { timeout: 10000 });
  } catch (error) {
    // Automatically handles network timeouts, connection issues
  }
};
```

### Validation Errors

```typescript
// Server-side validation
import { validateRequired } from '@/lib/error-handling';

export const POST = withApiMiddleware(async (request, response) => {
  const body = await request.json();
  
  // Validate required fields
  validateRequired(body, ['name', 'email'], context.requestId);
  
  // Continue processing...
});
```

### Database Errors

```typescript
// Automatic database error handling
try {
  await executeQuery('INSERT INTO users (email) VALUES (?)', [email]);
} catch (error) {
  // Automatically converts MySQL errors to user-friendly messages
  // ER_DUP_ENTRY -> "Data sudah ada"
  // ER_NO_REFERENCED_ROW_2 -> "Data rujukan tidak ditemukan"
  handleDatabaseError(error, 'createUser');
}
```

## Testing Error Handling

### Manual Testing

1. **Network Errors**: Disconnect internet, test offline behavior
2. **Server Errors**: Stop database, test database connection errors
3. **Validation Errors**: Submit forms with invalid data
4. **Authentication Errors**: Use expired tokens
5. **Permission Errors**: Access restricted resources

### Error Recovery

The system provides automatic error recovery:
- **Retry mechanisms** for transient failures
- **Fallback UI** when components fail
- **Graceful degradation** when features are unavailable
- **User guidance** for resolving issues

## Monitoring and Debugging

### Production Monitoring

```typescript
// Errors are automatically logged with:
logger.error('API Error', {
  requestId: 'req_123',
  userId: 'user_456',
  operation: 'GET_PROFILE',
  statusCode: 500,
  duration: 2500
}, error);
```

### Development Debugging

- Error boundaries show stack traces in development
- Detailed error context in console logs
- Performance monitoring for slow operations
- Request/response logging for API debugging

## Best Practices

1. **Always wrap async operations** in try-catch blocks
2. **Provide meaningful error messages** in Indonesian
3. **Include context** in error logs for debugging
4. **Use appropriate error types** for different scenarios
5. **Test error scenarios** during development
6. **Monitor error rates** in production
7. **Provide recovery actions** for users when possible
8. **Log errors without exposing sensitive data**

## Error Message Guidelines

### User-Facing Messages (Indonesian)

- Use clear, non-technical language
- Provide actionable guidance when possible
- Be specific about what went wrong
- Offer next steps or alternatives

Example:
```
❌ "Database connection failed"
✅ "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi."

❌ "Validation error"
✅ "Data yang Anda masukkan tidak valid. Silakan periksa kembali formulir."
```

This comprehensive error handling system ensures a robust, user-friendly application that gracefully handles errors and provides meaningful feedback to users while maintaining detailed logs for developers.
