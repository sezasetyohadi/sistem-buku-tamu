/**
 * React Hook for Form Validation
 * Provides easy integration with React forms and real-time validation
 */

import { useState, useCallback, useRef } from 'react';
import { 
  ValidationSchema, 
  ValidationResult, 
  validateSchema, 
  validateSingleField,
  createDebouncedValidator 
} from '@/lib/validation';
import { showToast } from '@/lib/toast';

export interface UseValidationOptions {
  schema: ValidationSchema;
  showToastOnError?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface UseValidationReturn {
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  validate: () => ValidationResult;
  validateField: (fieldName: string) => string | null;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
  setFieldError: (fieldName: string, error: string) => void;
  hasError: (fieldName: string) => boolean;
  getError: (fieldName: string) => string | undefined;
  onFieldChange: (fieldName: string, value: any) => void;
  onFieldBlur: (fieldName: string) => void;
}

/**
 * Custom hook for form validation
 */
export function useValidation(
  data: Record<string, any>,
  options: UseValidationOptions
): UseValidationReturn {
  const {
    schema,
    showToastOnError = false,
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Create debounced validator
  const debouncedValidator = useRef(
    createDebouncedValidator(schema, debounceMs)
  );

  // Validate entire form
  const validate = useCallback((): ValidationResult => {
    const result = validateSchema(data, schema);
    setErrors(result.errors);
    
    if (!result.isValid && showToastOnError && result.firstError) {
      showToast.validation(result.firstError);
    }
    
    return result;
  }, [data, schema, showToastOnError]);

  // Validate single field
  const validateField = useCallback((fieldName: string): string | null => {
    const error = validateSingleField(data, fieldName, schema);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
    
    return error;
  }, [data, schema]);

  // Clear single field error
  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Set field error manually
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  // Check if field has error
  const hasError = useCallback((fieldName: string): boolean => {
    return fieldName in errors;
  }, [errors]);

  // Get field error message
  const getError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName];
  }, [errors]);

  // Handle field change (for real-time validation)
  const onFieldChange = useCallback((fieldName: string, value: any) => {
    if (validateOnChange) {
      setIsValidating(true);
      
      debouncedValidator.current(data, fieldName, (error) => {
        if (error) {
          setErrors(prev => ({ ...prev, [fieldName]: error }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
        setIsValidating(false);
      });
    }
  }, [data, validateOnChange]);

  // Handle field blur
  const onFieldBlur = useCallback((fieldName: string) => {
    if (validateOnBlur) {
      validateField(fieldName);
    }
  }, [validateField, validateOnBlur]);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    isValidating,
    validate,
    validateField,
    clearError,
    clearAllErrors,
    setFieldError,
    hasError,
    getError,
    onFieldChange,
    onFieldBlur
  };
}

/**
 * Hook for simple field validation (single field)
 */
export function useFieldValidation(
  value: any,
  fieldName: string,
  schema: ValidationSchema,
  data?: Record<string, any>
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidator = useRef(
    createDebouncedValidator(schema, 300)
  );

  const validate = useCallback(() => {
    const fieldError = validateSingleField(data || { [fieldName]: value }, fieldName, schema);
    setError(fieldError);
    return fieldError;
  }, [value, fieldName, schema, data]);

  const validateWithDebounce = useCallback(() => {
    setIsValidating(true);
    
    debouncedValidator.current(
      data || { [fieldName]: value }, 
      fieldName, 
      (fieldError) => {
        setError(fieldError);
        setIsValidating(false);
      }
    );
  }, [value, fieldName, data]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isValidating,
    hasError: error !== null,
    validate,
    validateWithDebounce,
    clearError
  };
}

/**
 * Hook for form submission with validation
 */
export function useValidatedSubmit<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema,
  onSubmit: (validData: T) => Promise<void> | void,
  options: {
    showToastOnError?: boolean;
    resetOnSuccess?: boolean;
  } = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = useValidation(data, {
    schema,
    showToastOnError: options.showToastOnError
  });

  const submit = useCallback(async () => {
    setSubmitError(null);
    
    // Validate form
    const result = validation.validate();
    if (!result.isValid) {
      if (result.firstError) {
        showToast.validation(result.firstError);
      }
      return false;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      
      if (options.resetOnSuccess) {
        validation.clearAllErrors();
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      setSubmitError(errorMessage);
      showToast.error(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validation, onSubmit, options]);

  return {
    ...validation,
    isSubmitting,
    submitError,
    submit,
    clearSubmitError: () => setSubmitError(null)
  };
}
