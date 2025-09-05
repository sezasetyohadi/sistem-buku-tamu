# 🛡️ Validation System Documentation

## Overview

The validation system provides a centralized, schema-based approach to form validation with consistent error messages, real-time feedback, and security features.

## Core Components

### 1. Validation Engine (`/src/lib/validation.ts`)
- Schema-based validation with TypeScript support
- Common validation patterns (email, phone, URL, etc.)
- Custom validation functions
- Cross-field validation support

### 2. Validation Schemas (`/src/lib/validation-schemas.ts`)
- Pre-defined schemas for common forms
- Guest registration, admin login, survey forms
- Consistent validation rules across the application

### 3. React Hooks (`/src/hooks/useValidation.ts`)
- `useValidation`: Full form validation with real-time feedback
- `useFieldValidation`: Single field validation
- `useValidatedSubmit`: Form submission with validation

### 4. Enhanced Components (`/src/components/ui/ValidatedFormComponents.tsx`)
- `ValidatedInput`: Input with built-in validation feedback
- `ValidatedSelect`: Select dropdown with validation
- `ValidatedTextarea`: Textarea with character count
- `ValidatedSubmitButton`: Submit button with loading states

### 5. API Validation (`/src/lib/api-validation.ts`)
- Server-side validation utilities
- Request sanitization and rate limiting
- Standardized API responses

## Usage Examples

### Basic Form Validation

```tsx
import { useValidation } from '@/hooks/useValidation';
import { GUEST_REGISTRATION_SCHEMA } from '@/lib/validation-schemas';

function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const validation = useValidation(formData, {
    schema: GUEST_REGISTRATION_SCHEMA,
    validateOnBlur: true,
    showToastOnError: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validation.validate();
    if (result.isValid) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        error={validation.getError('name')}
        touched={validation.hasError('name')}
        required
      />
      <button type="submit" disabled={!validation.isValid}>
        Submit
      </button>
    </form>
  );
}
```

### Form with Automatic Submission

```tsx
import { useValidatedSubmit } from '@/hooks/useValidation';

function AutoSubmitForm() {
  const [formData, setFormData] = useState({ /* ... */ });

  const validation = useValidatedSubmit(
    formData,
    GUEST_REGISTRATION_SCHEMA,
    async (validData) => {
      const response = await submitForm(validData);
      if (!response.ok) throw new Error('Submission failed');
    },
    {
      showToastOnError: true,
      resetOnSuccess: true
    }
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); validation.submit(); }}>
      {/* Form fields */}
      <ValidatedSubmitButton
        isSubmitting={validation.isSubmitting}
        isValid={validation.isValid}
      >
        Submit
      </ValidatedSubmitButton>
    </form>
  );
}
```

### Custom Validation Schema

```tsx
import { ValidationSchema, VALIDATION_PATTERNS } from '@/lib/validation';

const CUSTOM_SCHEMA: ValidationSchema = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.USERNAME,
    message: 'Username must be 3-20 characters (letters, numbers, underscore)'
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value) => {
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      
      if (!hasUpper || !hasLower || !hasNumber) {
        return 'Password must contain uppercase, lowercase, and numbers';
      }
      return null;
    }
  },
  confirmPassword: {
    required: true,
    custom: (value, data) => {
      if (value !== data?.password) {
        return 'Passwords do not match';
      }
      return null;
    }
  }
};
```

### API Route Validation

```tsx
// /src/app/api/guests/route.ts
import { validateAndSanitizeInput, createApiResponse, createErrorResponse } from '@/lib/api-validation';
import { GUEST_REGISTRATION_SCHEMA } from '@/lib/validation-schemas';

export async function POST(request: NextRequest) {
  // Validate and sanitize input
  const validation = await validateAndSanitizeInput(request, GUEST_REGISTRATION_SCHEMA);
  
  if (!validation.success) {
    return validation.response; // Returns error response
  }

  const sanitizedData = validation.data;
  
  try {
    // Process the sanitized data
    const result = await createGuest(sanitizedData);
    
    return createApiResponse(result, 'Guest created successfully', true, 201);
  } catch (error) {
    return createErrorResponse('Failed to create guest', undefined, 500);
  }
}
```

## Validation Rules

### Built-in Rules

| Rule | Description | Example |
|------|-------------|---------|
| `required` | Field must have a value | `{ required: true }` |
| `minLength` | Minimum string length | `{ minLength: 3 }` |
| `maxLength` | Maximum string length | `{ maxLength: 100 }` |
| `email` | Valid email format | `{ email: true }` |
| `phone` | Valid phone number (Indonesian format) | `{ phone: true }` |
| `url` | Valid URL format | `{ url: true }` |
| `numeric` | Numeric value only | `{ numeric: true }` |
| `integer` | Integer value only | `{ integer: true }` |
| `min` | Minimum numeric value | `{ min: 0 }` |
| `max` | Maximum numeric value | `{ max: 100 }` |
| `pattern` | RegExp pattern match | `{ pattern: /^[A-Z]+$/ }` |
| `custom` | Custom validation function | `{ custom: (val, data) => ... }` |

### Common Patterns

```tsx
import { VALIDATION_PATTERNS } from '@/lib/validation';

// Available patterns:
VALIDATION_PATTERNS.EMAIL      // Email validation
VALIDATION_PATTERNS.PHONE      // Indonesian phone numbers
VALIDATION_PATTERNS.NAME       // Names (letters and spaces)
VALIDATION_PATTERNS.USERNAME   // Usernames (letters, numbers, underscore)
VALIDATION_PATTERNS.URL        // URLs
VALIDATION_PATTERNS.ALPHA_NUMERIC // Letters and numbers only
VALIDATION_PATTERNS.NUMERIC    // Numbers only
VALIDATION_PATTERNS.DECIMAL    // Decimal numbers
```

## Pre-defined Schemas

### Available Schemas

- `GUEST_REGISTRATION_SCHEMA`: Guest registration form
- `ADMIN_LOGIN_SCHEMA`: Admin login form
- `ADMIN_PROFILE_SCHEMA`: Admin profile update
- `SURVEY_IDENTITY_SCHEMA`: Survey respondent identity
- `TOKEN_VERIFICATION_SCHEMA`: Token verification
- `EMAIL_REQUEST_SCHEMA`: Email request forms
- `SURVEY_QUESTION_SCHEMA`: Survey question creation
- `PASSWORD_RESET_SCHEMA`: Password reset forms
- `REPORT_FILTER_SCHEMA`: Report date filters
- `GUEST_STATUS_SCHEMA`: Guest status updates
- `FILE_UPLOAD_SCHEMA`: File upload validation

## Security Features

### Input Sanitization
```tsx
import { sanitizeInput } from '@/lib/api-validation';

const sanitized = sanitizeInput(userInput);
// Prevents XSS attacks by escaping HTML characters
```

### Rate Limiting
```tsx
import { withRateLimit } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  // Apply rate limiting (10 requests per minute)
  const rateLimitResult = withRateLimit(10, 60000)(request);
  if (rateLimitResult) return rateLimitResult;
  
  // Continue with request processing
}
```

## Error Handling

### Client-side Error Display
- Real-time validation feedback
- Toast notifications for form errors
- Visual indicators (red borders, error icons)
- Accessible error messages

### Server-side Error Responses
```tsx
// Standardized error response format
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email format is invalid",
    "phone": "Phone number is required"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Best Practices

### 1. Schema Design
- Keep schemas focused and reusable
- Use descriptive field names
- Provide clear error messages
- Consider cross-field validation needs

### 2. Form Integration
- Validate on blur for better UX
- Show loading states during submission
- Clear errors when fields are corrected
- Provide helpful hints and examples

### 3. API Security
- Always validate on the server side
- Sanitize inputs to prevent injection
- Implement rate limiting for sensitive endpoints
- Use consistent error response formats

### 4. Performance
- Debounce real-time validation (default 300ms)
- Validate only changed fields
- Cache validation results when possible
- Minimize validation rule complexity

## Migration Guide

### Replacing Existing Forms

1. **Identify validation logic** in existing forms
2. **Create or use existing schema** from validation-schemas.ts
3. **Replace form components** with validated versions
4. **Update submit handlers** to use validation hooks
5. **Test thoroughly** with edge cases

### Example Migration

**Before:**
```tsx
// Old form with manual validation
const handleSubmit = (e) => {
  e.preventDefault();
  if (!email.trim()) {
    alert('Email is required');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    alert('Email is invalid');
    return;
  }
  // Submit logic
};
```

**After:**
```tsx
// New form with validation system
const validation = useValidatedSubmit(
  formData,
  EMAIL_REQUEST_SCHEMA,
  async (validData) => {
    // Submit logic with validated data
  }
);

const handleSubmit = (e) => {
  e.preventDefault();
  validation.submit();
};
```

## Troubleshooting

### Common Issues

1. **Validation not triggering**: Check schema field names match form data keys
2. **Custom validation errors**: Ensure custom functions return string or null
3. **Cross-field validation**: Use data parameter in custom validation
4. **Performance issues**: Increase debounce delay or disable real-time validation

### Debug Mode
Set `NODE_ENV=development` to see validation debug information in forms.

---

This validation system provides a robust foundation for secure, user-friendly forms throughout the application. It centralizes validation logic, improves consistency, and enhances security while maintaining excellent developer experience.
