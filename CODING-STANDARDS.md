# Coding Standards & Guidelines

This document outlines the coding standards and best practices for the Sistem Buku Tamu project.

## Table of Contents

- [TypeScript Standards](#typescript-standards)
- [React Component Guidelines](#react-component-guidelines)
- [File Naming Conventions](#file-naming-conventions)
- [Import/Export Standards](#importexport-standards)
- [Documentation Standards](#documentation-standards)
- [Database & API Guidelines](#database--api-guidelines)
- [Error Handling Standards](#error-handling-standards)
- [Security Guidelines](#security-guidelines)

## TypeScript Standards

### Type Definitions

✅ **DO:**
```typescript
// Use explicit interface definitions
interface User {
  id: number;
  name: string;
  email: string;
}

// Use proper generic types
function processData<T>(data: T[]): T[] {
  return data.filter(Boolean);
}

// Use union types for enums
type Status = 'pending' | 'approved' | 'rejected';
```

❌ **DON'T:**
```typescript
// Avoid using 'any' type
function processData(data: any): any {
  return data;
}

// Don't use loose typing
let user; // Type is 'any'
```

### Strict Mode Configuration

- ✅ Enable `strict: true` in tsconfig.json
- ✅ Use `noUnusedLocals` and `noUnusedParameters`
- ✅ Enable `noImplicitReturns`
- ✅ Use `exactOptionalPropertyTypes`

### Null Safety

```typescript
// Always handle potential null/undefined values
const user = await getUserById(id);
if (!user) {
  throw new Error('User not found');
}

// Use optional chaining
const email = user?.profile?.email;

// Use nullish coalescing
const displayName = user.name ?? 'Anonymous';
```

## React Component Guidelines

### Component Structure

```typescript
/**
 * User profile component
 * @param user - User data object
 * @param onEdit - Callback when edit is triggered
 */
interface UserProfileProps {
  user: User;
  onEdit: (userId: number) => void;
  className?: string;
}

export function UserProfile({ user, onEdit, className }: UserProfileProps) {
  // Hooks at the top
  const [isEditing, setIsEditing] = useState(false);
  
  // Event handlers
  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    onEdit(user.id);
  }, [user.id, onEdit]);
  
  // Early returns
  if (!user) {
    return <div>Loading...</div>;
  }
  
  // Main render
  return (
    <div className={cn('user-profile', className)}>
      {/* Component content */}
    </div>
  );
}
```

### Hook Usage

```typescript
// Custom hooks should start with 'use'
function useUserData(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await api.getUser(userId);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [userId]);
  
  return { user, loading };
}
```

## File Naming Conventions

### Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── forms/           # Form components
│   └── charts/          # Chart components
├── pages/               # Next.js pages
├── api/                 # API routes
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── backend/             # Backend logic
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   └── config/          # Configuration files
└── styles/              # CSS/styling files
```

### File Naming
- ✅ Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- ✅ Hooks: `camelCase.ts` (e.g., `useUserData.ts`)
- ✅ Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- ✅ Types: `kebab-case.ts` (e.g., `api-types.ts`)
- ✅ Constants: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

## Import/Export Standards

### Import Order
```typescript
// 1. Node modules
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';

// 2. Internal components (alphabetical)
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 3. Types
import type { User, ApiResponse } from '@/types/api-types';

// 4. Relative imports
import { validateUser } from '../utils/validation';
import './Component.css';
```

### Export Standards
```typescript
// Prefer named exports
export function UserService() {
  // ...
}

export const USER_CONSTANTS = {
  // ...
};

// Use default exports only for pages and main components
export default function UserPage() {
  // ...
}
```

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Retrieves user data from the database
 * 
 * @description This function fetches user information including profile data,
 * permissions, and recent activity. It includes caching for performance.
 * 
 * @param {number} userId - The unique identifier for the user
 * @param {object} options - Optional configuration
 * @param {boolean} options.includeProfile - Whether to include profile data
 * @param {boolean} options.useCache - Whether to use cached data
 * 
 * @returns {Promise<User>} Promise that resolves to user data
 * 
 * @throws {NotFoundError} When user doesn't exist
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * ```typescript
 * const user = await getUserById(123, { includeProfile: true });
 * console.log(user.name);
 * ```
 * 
 * @since 1.0.0
 * @version 1.2.0
 */
async function getUserById(userId: number, options: GetUserOptions = {}): Promise<User> {
  // Implementation
}
```

### Interface Documentation
```typescript
/**
 * User profile information
 * @interface UserProfile
 */
interface UserProfile {
  /** User's unique identifier */
  id: number;
  
  /** Full name of the user */
  name: string;
  
  /** Contact email address */
  email: string;
  
  /** User's role in the system */
  role: 'admin' | 'user' | 'guest';
  
  /** Account creation timestamp */
  createdAt: Date;
  
  /** Optional profile picture URL */
  avatar?: string;
}
```

## Database & API Guidelines

### Query Functions
```typescript
/**
 * Database query wrapper with error handling
 */
async function executeQuery<T = RowDataPacket[]>(
  query: string, 
  params: unknown[] = []
): Promise<T> {
  try {
    const [rows] = await connection.execute(query, params);
    return rows as T;
  } catch (error) {
    logger.error('Database query failed:', { query, params, error });
    throw new DatabaseError('Query execution failed', { cause: error });
  }
}
```

### API Response Format
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
  requestId: string;
}

// Consistent error responses
interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId: string;
}
```

## Error Handling Standards

### Custom Error Classes
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public query?: string,
    public code: string = 'DATABASE_ERROR'
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

### Error Handling Patterns
```typescript
// API route error handling
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await processData(data);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Operation successful'
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        message: error.message,
        code: error.code
      }, { status: 400 });
    }
    
    logger.error('Unexpected error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
```

## Security Guidelines

### Input Validation
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

function validateUserInput(data: unknown) {
  return UserSchema.parse(data);
}
```

### SQL Injection Prevention
```typescript
// ✅ Always use parameterized queries
const user = await executeQuery(
  'SELECT * FROM users WHERE id = ? AND email = ?',
  [userId, email]
);

// ❌ Never use string concatenation
const user = await executeQuery(
  `SELECT * FROM users WHERE id = ${userId}` // DANGEROUS!
);
```

### Authentication & Authorization
```typescript
export async function withAuth<T>(
  handler: (req: Request, user: User) => Promise<T>
) {
  return async (req: Request) => {
    const token = extractToken(req);
    
    if (!token) {
      throw new AuthenticationError('Token required');
    }
    
    const user = await verifyToken(token);
    
    if (!user) {
      throw new AuthenticationError('Invalid token');
    }
    
    return handler(req, user);
  };
}
```

## Code Quality Checklist

Before submitting code, ensure:

- [ ] All TypeScript errors are resolved
- [ ] ESLint warnings are addressed
- [ ] Unit tests are written and passing
- [ ] JSDoc comments are added to public functions
- [ ] Error handling is implemented
- [ ] Input validation is in place
- [ ] No sensitive data is logged
- [ ] Performance implications are considered
- [ ] Code is readable and well-structured
- [ ] Dependencies are properly managed

## Tools & Automation

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### VS Code Settings
```json
{
  "typescript.preferences.strictNullChecks": true,
  "typescript.preferences.noImplicitAny": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

---

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Next.js Documentation](https://nextjs.org/docs)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
