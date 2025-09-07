/**
 * Custom Hooks for Error Handling and API State Management
 */

'use client';

import { useState, useCallback } from 'react';
import { AppError, ErrorType } from '@/lib/error-handling';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiState<T>(initialData: T | null = null): [
  ApiState<T>,
  {
    setLoading: (loading: boolean) => void;
    setData: (data: T) => void;
    setError: (error: string | null) => void;
    reset: () => void;
  }
] {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({ data, loading: false, error: null });
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, loading: false, error }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return [state, { setLoading, setData, setError, reset }];
}

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    let errorMessage = 'Terjadi kesalahan yang tidak terduga';

    if (error instanceof AppError) {
      errorMessage = error.userMessage;
    } else if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('fetch')) {
        errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Data yang diterima tidak valid.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Terjadi kesalahan jaringan.';
      } else {
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setError(errorMessage);
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export function useFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const fetchData = useCallback(async <T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    const { timeout = 10000, ...fetchOptions } = options;
    
    setIsLoading(true);
    clearError();

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server tidak merespons');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const get = useCallback(<T>(url: string, options?: FetchOptions) => {
    return fetchData<T>(url, { ...options, method: 'GET' });
  }, [fetchData]);

  const post = useCallback(<T>(url: string, data?: any, options?: FetchOptions) => {
    return fetchData<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }, [fetchData]);

  const put = useCallback(<T>(url: string, data?: any, options?: FetchOptions) => {
    return fetchData<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }, [fetchData]);

  const del = useCallback(<T>(url: string, options?: FetchOptions) => {
    return fetchData<T>(url, { ...options, method: 'DELETE' });
  }, [fetchData]);

  return {
    isLoading,
    error,
    clearError,
    fetchData,
    get,
    post,
    put,
    delete: del,
    handleError
  };
}

export function useAsyncOperation<T = any>() {
  const [state, { setLoading, setData, setError, reset }] = useApiState<T>();
  const { handleError } = useErrorHandler();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ) => {
    try {
      setLoading(true);
      const result = await operation();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (error) {
      handleError(error);
      setError(error instanceof Error ? error.message : String(error));
      onError?.(error);
      throw error;
    }
  }, [setLoading, setData, setError, handleError]);

  return {
    ...state,
    execute,
    reset
  };
}

// Utility function for handling form submissions
export function useFormSubmission<T = any>() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (
    operation: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ) => {
    setIsSubmitting(true);
    setSuccess(false);
    clearError();

    try {
      const result = await operation();
      setSuccess(true);
      onSuccess?.(result);
      return result;
    } catch (error) {
      handleError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [handleError, clearError]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSuccess(false);
    clearError();
  }, [clearError]);

  return {
    isSubmitting,
    success,
    error,
    submit,
    reset,
    clearError
  };
}
