/**
 * Improved Admin Login Form with Validation System
 * Example of login form using new validation system
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useValidatedSubmit } from '@/hooks/useValidation';
import { ADMIN_LOGIN_SCHEMA } from '@/lib/validation-schemas';
import { 
  ValidatedInput, 
  ValidatedSubmitButton 
} from '@/components/ui/ValidatedFormComponents';
import { showToast } from '@/lib/toast';
import { authLogger } from '@/lib/logger';

interface ImprovedLoginFormProps {
  onSuccess?: () => void;
}

export default function ImprovedLoginForm({ onSuccess }: ImprovedLoginFormProps) {
  const { login } = useAuth();
  
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // Use validation hook
  const validation = useValidatedSubmit(
    formData,
    ADMIN_LOGIN_SCHEMA,
    async (validData) => {
      try {
        authLogger.info('Attempting admin login');
        
        // Save credentials if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('adminRememberedCredentials', JSON.stringify({
            username: validData.username
          }));
        } else {
          localStorage.removeItem('adminRememberedCredentials');
        }

        // Use AuthContext login method
        await login(validData.username, validData.password);
        
        showToast.success('Login berhasil! Selamat datang kembali.');
        authLogger.info(`Admin login successful: ${validData.username}`);
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
        
      } catch (error) {
        authLogger.error('Login failed:', error);
        throw error;
      }
    },
    {
      showToastOnError: true
    }
  );

  // Handle form field changes
  const handleFieldChange = (fieldName: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (typeof value === 'string') {
      validation.onFieldChange(fieldName, value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validation.submit();
  };

  // Load remembered credentials on component mount
  React.useEffect(() => {
    const savedCredentials = localStorage.getItem('adminRememberedCredentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setFormData(prev => ({
          ...prev,
          username: credentials.username || '',
          rememberMe: true
        }));
      } catch (error) {
        authLogger.error('Error loading saved credentials:', error);
        localStorage.removeItem('adminRememberedCredentials');
      }
    }
  }, []);

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Username Field */}
        <ValidatedInput
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) => handleFieldChange('username', e.target.value)}
          onBlur={() => validation.onFieldBlur('username')}
          error={validation.getError('username')}
          touched={!!formData.username || validation.hasError('username')}
          required
          placeholder="Masukkan username"
          disabled={validation.isSubmitting}
          autoComplete="username"
          autoFocus
        />

        {/* Password Field */}
        <ValidatedInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          onBlur={() => validation.onFieldBlur('password')}
          error={validation.getError('password')}
          touched={!!formData.password || validation.hasError('password')}
          required
          placeholder="Masukkan password"
          disabled={validation.isSubmitting}
          autoComplete="current-password"
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleFieldChange('rememberMe', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={validation.isSubmitting}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Ingat saya
            </label>
          </div>

          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            disabled={validation.isSubmitting}
            onClick={() => showToast.info('Fitur lupa password akan segera tersedia')}
          >
            Lupa password?
          </button>
        </div>

        {/* Submit Button */}
        <ValidatedSubmitButton
          isSubmitting={validation.isSubmitting}
          isValid={validation.isValid}
          loadingText="Memproses login..."
        >
          Masuk
        </ValidatedSubmitButton>

        {/* Additional Error Display */}
        {validation.submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validation.submitError}
            </p>
          </div>
        )}

        {/* Development Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
            <p><strong>Validation Debug:</strong></p>
            <p>Valid: {validation.isValid ? 'Yes' : 'No'}</p>
            <p>Submitting: {validation.isSubmitting ? 'Yes' : 'No'}</p>
            <p>Errors: {Object.keys(validation.errors).length}</p>
            {Object.keys(validation.errors).length > 0 && (
              <pre className="text-red-600 mt-1">
                {JSON.stringify(validation.errors, null, 2)}
              </pre>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
