/**
 * Enhanced Form Components with Built-in Validation
 * Provides form inputs with automatic validation feedback
 */

import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

// Base input props with validation
interface BaseInputProps {
  error?: string;
  touched?: boolean;
  showValidIcon?: boolean;
  className?: string;
  disabled?: boolean;
}

// Enhanced Input Component
interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>, BaseInputProps {
  label?: string;
  hint?: string;
  required?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(({
  label,
  hint,
  error,
  touched,
  showValidIcon = true,
  required,
  className,
  disabled,
  ...props
}, ref) => {
  const hasError = !!error && touched;
  const isValid = touched && !error && props.value && showValidIcon;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : isValid
              ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
            disabled && 'bg-gray-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {/* Validation Icons */}
        {(hasError || isValid) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasError ? (
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : isValid ? (
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {/* Hint */}
      {hint && !hasError && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

// Enhanced Select Component
interface ValidatedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'>, BaseInputProps {
  label?: string;
  hint?: string;
  required?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const ValidatedSelect = forwardRef<HTMLSelectElement, ValidatedSelectProps>(({
  label,
  hint,
  error,
  touched,
  required,
  options,
  placeholder = 'Pilih...',
  className,
  disabled,
  ...props
}, ref) => {
  const hasError = !!error && touched;
  const isValid = touched && !error && props.value && options.length > 0;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'bg-white appearance-none',
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : isValid
              ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
            disabled && 'bg-gray-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {/* Hint */}
      {hint && !hasError && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

ValidatedSelect.displayName = 'ValidatedSelect';

// Enhanced Textarea Component
interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>, BaseInputProps {
  label?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(({
  label,
  hint,
  error,
  touched,
  required,
  maxLength,
  showCharacterCount = false,
  className,
  disabled,
  ...props
}, ref) => {
  const hasError = !!error && touched;
  const isValid = touched && !error && props.value;
  const currentLength = typeof props.value === 'string' ? props.value.length : 0;

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {showCharacterCount && maxLength && (
            <span className={cn(
              'text-xs',
              currentLength > maxLength ? 'text-red-500' : 'text-gray-500'
            )}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        ref={ref}
        maxLength={maxLength}
        className={cn(
          'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors resize-y',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : isValid
            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
          disabled && 'bg-gray-50 cursor-not-allowed',
          className
        )}
        disabled={disabled}
        {...props}
      />
      
      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {/* Hint */}
      {hint && !hasError && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

ValidatedTextarea.displayName = 'ValidatedTextarea';

// Form Group Component for better organization
interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Submit Button with validation state
interface ValidatedSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  isValid?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const ValidatedSubmitButton: React.FC<ValidatedSubmitButtonProps> = ({
  isSubmitting = false,
  isValid = true,
  loadingText = 'Memproses...',
  children,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || isSubmitting || !isValid;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        'w-full flex justify-center py-2 px-4 border border-transparent rounded-lg',
        'text-sm font-medium text-white transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        className
      )}
      {...props}
    >
      {isSubmitting ? (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};
