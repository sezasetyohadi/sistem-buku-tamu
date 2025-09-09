/**
 * Centralized Validation System
 * Provides schema-based validation with consistent error messages and sanitization
 */

import { logger } from '@/lib/logger';
import validator from 'validator';
import { ValidationError } from '@/lib/error-handling';

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
  PHONE: /^(\+62|62|0)[0-9]{8,14}$/,
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

// ================== SANITIZATION FUNCTIONS ==================

/**
 * Sanitization options interface
 */
export interface SanitizationOptions {
  trim?: boolean;
  escape?: boolean;
  normalizeEmail?: boolean;
  normalizeWhitespace?: boolean;
  removeSpecialChars?: boolean;
  maxLength?: number;
  lowercase?: boolean;
  uppercase?: boolean;
}

/**
 * Sanitize a string value based on options
 */
export function sanitizeString(value: string, options: SanitizationOptions = {}): string {
  let sanitized = value;

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Normalize whitespace (replace multiple spaces with single space)
  if (options.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  // Convert case
  if (options.lowercase) {
    sanitized = sanitized.toLowerCase();
  }
  if (options.uppercase) {
    sanitized = sanitized.toUpperCase();
  }

  // Remove special characters (keep only alphanumeric, spaces, and basic punctuation)
  if (options.removeSpecialChars) {
    sanitized = sanitized.replace(/[^\w\s.,!?-]/g, '');
  }

  // Escape HTML entities
  if (options.escape) {
    sanitized = validator.escape(sanitized);
  }

  // Limit length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string, options: SanitizationOptions = {}): string {
  let sanitized = email.trim().toLowerCase();

  // Normalize email if requested
  if (options.normalizeEmail) {
    sanitized = validator.normalizeEmail(sanitized, {
      gmail_lowercase: true,
      gmail_remove_dots: false,
      outlookdotcom_lowercase: true,
      yahoo_lowercase: true,
      icloud_lowercase: true
    }) || sanitized;
  }

  return sanitized;
}

/**
 * Sanitize phone numbers
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-numeric characters except +
  let sanitized = phone.replace(/[^\d+]/g, '');
  
  // Convert Indonesian format
  if (sanitized.startsWith('0')) {
    sanitized = '+62' + sanitized.substring(1);
  } else if (sanitized.startsWith('62') && !sanitized.startsWith('+62')) {
    sanitized = '+' + sanitized;
  } else if (!sanitized.startsWith('+') && sanitized.length > 8) {
    sanitized = '+62' + sanitized;
  }

  return sanitized;
}

/**
 * Sanitize a data object based on schema rules
 */
export function sanitizeData(
  data: Record<string, any>, 
  sanitizationRules: Record<string, SanitizationOptions>
): Record<string, any> {
  const sanitized: Record<string, any> = { ...data };

  for (const [field, options] of Object.entries(sanitizationRules)) {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeString(sanitized[field], options);
    }
  }

  validationLogger.debug('Data sanitization completed:', {
    fieldsProcessed: Object.keys(sanitizationRules),
    originalData: data,
    sanitizedData: sanitized
  });

  return sanitized;
}

/**
 * Comprehensive input sanitization for common use cases
 */
export const INPUT_SANITIZERS = {
  // General text input
  text: (value: string): string => sanitizeString(value, {
    trim: true,
    normalizeWhitespace: true,
    escape: true
  }),

  // Name fields (only letters and spaces)
  name: (value: string): string => value.trim().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '),

  // Email fields
  email: (value: string): string => sanitizeEmail(value, {
    normalizeEmail: true
  }),

  // Phone fields
  phone: (value: string): string => sanitizePhone(value),

  // URL fields
  url: (value: string): string => {
    let sanitized = value.trim();
    if (sanitized && !sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      sanitized = 'https://' + sanitized;
    }
    return sanitized;
  },

  // Textarea/description fields
  description: (value: string): string => sanitizeString(value, {
    trim: true,
    normalizeWhitespace: true,
    escape: true,
    maxLength: 1000
  }),

  // Username fields
  username: (value: string): string => sanitizeString(value, {
    trim: true,
    lowercase: true,
    removeSpecialChars: true
  }),

  // Password fields (minimal sanitization)
  password: (value: string): string => value.trim(),

  // Numeric strings
  numeric: (value: string): string => value.replace(/[^\d]/g, ''),

  // Decimal strings
  decimal: (value: string): string => value.replace(/[^\d.]/g, ''),
} as const;

/**
 * Apply multiple sanitizers to data
 */
export function applySanitizers(
  data: Record<string, any>,
  sanitizers: Record<string, keyof typeof INPUT_SANITIZERS>
): Record<string, any> {
  const sanitized: Record<string, any> = { ...data };

  for (const [field, sanitizerType] of Object.entries(sanitizers)) {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      const sanitizer = INPUT_SANITIZERS[sanitizerType];
      sanitized[field] = sanitizer(sanitized[field]);
    }
  }

  return sanitized;
}

// ================== VALIDATION SCHEMAS ==================

/**
 * Guest Registration Schema
 */
export const GUEST_REGISTRATION_SCHEMA: ValidationSchema = {
  nama: {
    required: true,
    minLength: 1,
    maxLength: 100,
    custom: (value) => {
      if (typeof value !== 'string') return 'Nama harus berupa text';
      
      // Sanitize the name: remove non-letters and normalize spaces
      const sanitized = value.trim().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');
      
      // Check if sanitized name is empty
      if (!sanitized) return 'Nama harus berisi huruf';
      
      // Check length after sanitization
      if (sanitized.length < 1) return 'Nama terlalu pendek';
      if (sanitized.length > 100) return 'Nama terlalu panjang (maksimal 100 karakter)';
      
      return null;
    },
    message: 'Nama harus berisi 1-100 karakter dan hanya huruf serta spasi'
  },
  email: {
    required: true,
    email: true,
    maxLength: 255,
    message: 'Email tidak valid atau terlalu panjang'
  },
  phone: {
    required: true,
    phone: true,
    message: 'Nomor telepon tidak valid (contoh: 08123456789 atau +6281234567890)'
  },
  alamat: {
    required: true,
    maxLength: 500,
    message: 'Alamat harus diisi dan maksimal 500 karakter'
  },
  jenis_kelamin: {
    required: true,
    custom: (value) => {
      if (value && !['Laki-laki', 'Perempuan'].includes(value)) {
        return 'Jenis kelamin harus Laki-laki atau Perempuan';
      }
      return null;
    },
    message: 'Jenis kelamin harus dipilih'
  },
  bidang_tujuan_id: {
    required: true,
    integer: true,
    min: 1,
    message: 'Pilih bidang tujuan yang valid'
  },
  pendidikan_terakhir_id: {
    required: true,
    integer: true,
    min: 1,
    message: 'Pilih pendidikan terakhir yang valid'
  },
  profesi_id: {
    required: true,
    integer: true,
    min: 1,
    message: 'Pilih profesi yang valid'
  },
  tujuan_kunjungan_id: {
    required: true,
    integer: true,
    min: 1,
    message: 'Pilih tujuan kunjungan yang valid'
  },
  instansi: {
    required: false,
    maxLength: 255,
    message: 'Nama instansi maksimal 255 karakter'
  },
  keterangan: {
    required: false,
    maxLength: 500,
    message: 'Keterangan maksimal 500 karakter'
  },
  cara_memperoleh: {
    required: true,
    custom: (value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return 'Pilih minimal satu cara memperoleh informasi';
      }
      // Allow array of numbers (IDs)
      if (!value.every(item => typeof item === 'number' && item > 0)) {
        return 'Cara memperoleh informasi tidak valid';
      }
      return null;
    },
    message: 'Pilih minimal satu cara memperoleh informasi'
  },
  cara_salinan: {
    required: false, // Changed from true to false - moved to schedule step
    custom: (value) => {
      if (value) {
        if (!Array.isArray(value)) {
          return 'Format cara mendapatkan salinan informasi tidak valid';
        }
        // Allow array of numbers (IDs) when provided
        if (!value.every(item => typeof item === 'number' && item > 0)) {
          return 'Cara mendapatkan salinan tidak valid';
        }
      }
      return null;
    },
    message: 'Format cara mendapatkan salinan informasi tidak valid'
  }
};

/**
 * Admin Login Schema
 */
export const ADMIN_LOGIN_SCHEMA: ValidationSchema = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.USERNAME,
    message: 'Username harus 3-50 karakter, hanya huruf, angka, dan underscore'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password minimal 6 karakter'
  }
};

/**
 * Survey Response Schema
 */
export const SURVEY_RESPONSE_SCHEMA: ValidationSchema = {
  guest_id: {
    required: true,
    integer: true,
    min: 1,
    message: 'ID tamu tidak valid'
  },
  ratings: {
    required: true,
    custom: (value) => {
      if (!value || typeof value !== 'object') {
        return 'Rating harus berupa objek';
      }
      
      // Check if all required rating questions are answered
      const ratings = value as Record<string, number>;
      const hasRatings = Object.keys(ratings).length > 0;
      
      if (!hasRatings) {
        return 'Minimal satu rating harus diisi';
      }

      // Validate each rating value
      for (const [questionId, rating] of Object.entries(ratings)) {
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
          return `Rating untuk pertanyaan ${questionId} harus antara 1-5`;
        }
      }

      return null;
    }
  },
  informasi_ids: {
    required: false,
    custom: (value) => {
      if (value && Array.isArray(value)) {
        const ids = value as number[];
        for (const id of ids) {
          if (!Number.isInteger(id) || id < 1) {
            return 'ID informasi tidak valid';
          }
        }
      }
      return null;
    }
  },
  salinan_ids: {
    required: false,
    custom: (value) => {
      if (value && Array.isArray(value)) {
        const ids = value as number[];
        for (const id of ids) {
          if (!Number.isInteger(id) || id < 1) {
            return 'ID salinan tidak valid';
          }
        }
      }
      return null;
    }
  }
};

/**
 * Password Reset Schema
 */
export const PASSWORD_RESET_SCHEMA: ValidationSchema = {
  token: {
    required: true,
    minLength: 10,
    message: 'Token reset password tidak valid'
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128,
    custom: (value) => {
      if (typeof value !== 'string') return 'Password harus berupa text';
      
      const password = value as string;
      
      // Check for at least one uppercase letter
      if (!/[A-Z]/.test(password)) {
        return 'Password harus mengandung minimal satu huruf besar';
      }
      
      // Check for at least one lowercase letter
      if (!/[a-z]/.test(password)) {
        return 'Password harus mengandung minimal satu huruf kecil';
      }
      
      // Check for at least one number
      if (!/\d/.test(password)) {
        return 'Password harus mengandung minimal satu angka';
      }
      
      return null;
    }
  },
  confirmPassword: {
    required: true,
    custom: (value, data) => {
      if (value !== data?.password) {
        return 'Konfirmasi password tidak cocok';
      }
      return null;
    }
  }
};

/**
 * Profile Update Schema
 */
export const PROFILE_UPDATE_SCHEMA: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.NAME,
    message: 'Nama harus berisi 2-100 karakter dan hanya huruf serta spasi'
  },
  email: {
    required: true,
    email: true,
    maxLength: 255,
    message: 'Email tidak valid atau terlalu panjang'
  },
  currentPassword: {
    required: false,
    minLength: 6,
    message: 'Password saat ini minimal 6 karakter'
  },
  newPassword: {
    required: false,
    minLength: 6,
    maxLength: 128,
    custom: (value, data) => {
      // Only validate if currentPassword is provided
      if (data?.currentPassword && !value) {
        return 'Password baru wajib diisi jika mengubah password';
      }
      
      if (value && typeof value === 'string') {
        // Same strength validation as password reset
        if (!/[A-Z]/.test(value)) {
          return 'Password harus mengandung minimal satu huruf besar';
        }
        if (!/[a-z]/.test(value)) {
          return 'Password harus mengandung minimal satu huruf kecil';
        }
        if (!/\d/.test(value)) {
          return 'Password harus mengandung minimal satu angka';
        }
      }
      
      return null;
    }
  }
};

// ================== SANITIZATION CONFIGURATIONS ==================

/**
 * Sanitization configurations for different schemas
 */
export const SANITIZATION_CONFIGS = {
  GUEST_REGISTRATION: {
    nama: { trim: true, normalizeWhitespace: true },
    email: { trim: true, lowercase: true, normalizeEmail: true },
    phone: { trim: true },
    alamat: { trim: true, normalizeWhitespace: true, escape: true },
    jenis_kelamin: { trim: true },
    instansi: { trim: true, normalizeWhitespace: true, escape: true },
    keterangan: { trim: true, normalizeWhitespace: true, escape: true, maxLength: 500 }
  },
  
  ADMIN_LOGIN: {
    username: { trim: true, lowercase: true },
    password: { trim: true }
  },
  
  PROFILE_UPDATE: {
    name: { trim: true, normalizeWhitespace: true, removeSpecialChars: true },
    email: { trim: true, lowercase: true, normalizeEmail: true },
    currentPassword: { trim: true },
    newPassword: { trim: true }
  }
} as const;

/**
 * Complete validation and sanitization function
 */
export function validateAndSanitize<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema,
  sanitizationConfig?: Record<string, SanitizationOptions>
): { isValid: boolean; data: T; errors: Record<string, string>; firstError?: string } {
  // First sanitize the data
  const sanitizedData = sanitizationConfig 
    ? sanitizeData(data, sanitizationConfig) as T
    : data;

  // Then validate the sanitized data
  const validationResult = validateSchema(sanitizedData, schema);

  return {
    isValid: validationResult.isValid,
    data: sanitizedData,
    errors: validationResult.errors,
    firstError: validationResult.firstError
  };
}

/**
 * Pre-configured validators for common use cases
 */
export const VALIDATORS = {
  guestRegistration: createValidator(GUEST_REGISTRATION_SCHEMA),
  adminLogin: createValidator(ADMIN_LOGIN_SCHEMA),
  surveyResponse: createValidator(SURVEY_RESPONSE_SCHEMA),
  passwordReset: createValidator(PASSWORD_RESET_SCHEMA),
  profileUpdate: createValidator(PROFILE_UPDATE_SCHEMA),
} as const;
