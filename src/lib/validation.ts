/**
 * Centralized Validation System
 * Provides schema-based validation with consistent error messages
 */

import { logger } from '@/lib/logger';

// Create validation logger
const validationLogger = logger.scope('VALIDATION');

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

// Base validation rules interface
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any, data?: Record<string, any>) => string | null;
  message?: string;
}

// Schema definition interface
export interface ValidationSchema {
  [field: string]: ValidationRule;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^(\+62|62|0)[0-9]{8,13}$/,
  NAME: /^[a-zA-Z\s]+$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]+)?$/,
} as const;

// Default error messages
export const DEFAULT_MESSAGES = {
  REQUIRED: 'Field ini wajib diisi',
  EMAIL_INVALID: 'Format email tidak valid',
  PHONE_INVALID: 'Format nomor telepon tidak valid',
  URL_INVALID: 'Format URL tidak valid',
  MIN_LENGTH: (min: number) => `Minimal ${min} karakter`,
  MAX_LENGTH: (max: number) => `Maksimal ${max} karakter`,
  MIN_VALUE: (min: number) => `Nilai minimal ${min}`,
  MAX_VALUE: (max: number) => `Nilai maksimal ${max}`,
  NUMERIC_ONLY: 'Hanya boleh berisi angka',
  INTEGER_ONLY: 'Hanya boleh berisi bilangan bulat',
  PATTERN_MISMATCH: 'Format tidak valid',
  NAME_INVALID: 'Hanya boleh berisi huruf dan spasi',
  USERNAME_INVALID: 'Hanya boleh berisi huruf, angka, dan underscore',
} as const;

/**
 * Validate a single value against a rule
 */
export function validateField(
  value: any, 
  rule: ValidationRule, 
  fieldName?: string, 
  data?: Record<string, any>
): string | null {
  const val = typeof value === 'string' ? value.trim() : value;

  // Required validation
  if (rule.required && (val === '' || val === null || val === undefined)) {
    return rule.message || DEFAULT_MESSAGES.REQUIRED;
  }

  // Skip other validations if value is empty and not required
  if (val === '' || val === null || val === undefined) {
    return null;
  }

  // String-based validations
  if (typeof val === 'string') {
    // Min length validation
    if (rule.minLength && val.length < rule.minLength) {
      return rule.message || DEFAULT_MESSAGES.MIN_LENGTH(rule.minLength);
    }

    // Max length validation
    if (rule.maxLength && val.length > rule.maxLength) {
      return rule.message || DEFAULT_MESSAGES.MAX_LENGTH(rule.maxLength);
    }

    // Email validation
    if (rule.email && !VALIDATION_PATTERNS.EMAIL.test(val)) {
      return rule.message || DEFAULT_MESSAGES.EMAIL_INVALID;
    }

    // Phone validation
    if (rule.phone && !VALIDATION_PATTERNS.PHONE.test(val)) {
      return rule.message || DEFAULT_MESSAGES.PHONE_INVALID;
    }

    // URL validation
    if (rule.url && !VALIDATION_PATTERNS.URL.test(val)) {
      return rule.message || DEFAULT_MESSAGES.URL_INVALID;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(val)) {
      return rule.message || DEFAULT_MESSAGES.PATTERN_MISMATCH;
    }
  }

  // Numeric validations
  if (rule.numeric || rule.integer) {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    if (isNaN(numVal)) {
      return rule.message || (rule.integer ? DEFAULT_MESSAGES.INTEGER_ONLY : DEFAULT_MESSAGES.NUMERIC_ONLY);
    }

    if (rule.integer && !Number.isInteger(numVal)) {
      return rule.message || DEFAULT_MESSAGES.INTEGER_ONLY;
    }

    // Min/Max value validation
    if (rule.min !== undefined && numVal < rule.min) {
      return rule.message || DEFAULT_MESSAGES.MIN_VALUE(rule.min);
    }

    if (rule.max !== undefined && numVal > rule.max) {
      return rule.message || DEFAULT_MESSAGES.MAX_VALUE(rule.max);
    }
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(val, data);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Validate an object against a schema
 */
export function validateSchema(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};
  let firstError: string | undefined;

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];
    const error = validateField(value, rule, field, data);

    if (error) {
      errors[field] = error;
      if (!firstError) {
        firstError = error;
      }
    }
  }

  const result = {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError
  };

  validationLogger.debug('Schema validation result:', {
    isValid: result.isValid,
    errorCount: Object.keys(errors).length,
    fields: Object.keys(schema)
  });

  return result;
}

/**
 * Validate a single field from a schema
 */
export function validateSingleField(
  data: Record<string, any>, 
  fieldName: string, 
  schema: ValidationSchema
): string | null {
  const rule = schema[fieldName];
  if (!rule) {
    validationLogger.warn(`No validation rule found for field: ${fieldName}`);
    return null;
  }

  return validateField(data[fieldName], rule, fieldName, data);
}

/**
 * Create a validation function for a specific schema
 */
export function createValidator(schema: ValidationSchema) {
  return (data: Record<string, any>): ValidationResult => {
    return validateSchema(data, schema);
  };
}

/**
 * Debounced field validation for real-time feedback
 */
export function createDebouncedValidator(
  schema: ValidationSchema,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (
    data: Record<string, any>,
    fieldName: string,
    callback: (error: string | null) => void
  ) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const error = validateSingleField(data, fieldName, schema);
      callback(error);
    }, delay);
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: Record<string, string>): string[] {
  return Object.entries(errors).map(([field, error]) => {
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    return `${fieldName}: ${error}`;
  });
}

/**
 * Check if field has error
 */
export function hasFieldError(errors: Record<string, string>, fieldName: string): boolean {
  return fieldName in errors;
}

/**
 * Get field error message
 */
export function getFieldError(errors: Record<string, string>, fieldName: string): string | undefined {
  return errors[fieldName];
}
