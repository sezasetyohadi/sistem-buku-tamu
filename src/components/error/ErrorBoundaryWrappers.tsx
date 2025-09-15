/**
 * Error Boundary Wrapped Components
 * Provides error handling for critical UI components
 */

'use client';

import React from 'react';

import { useGlobalErrorHandler, createError } from '@/lib/error-handler';

import { ComponentErrorBoundary, SectionErrorBoundary } from './ErrorBoundary';

/**
 * HOC for wrapping form components with error boundaries
 */
export function withFormErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const FormWithErrorBoundary = (props: P) => {
    const { handleError } = useGlobalErrorHandler();

    const handleFormError = (error: Error) => {
      const formError = createError.ui(
        `Error in ${componentName}: ${error.message}`,
        componentName
      );
      handleError(formError, {
        component: componentName,
        action: 'form_interaction',
      });
    };

    return (
      <ComponentErrorBoundary
        onError={handleFormError}
        fallback={
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Form Error
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Terjadi kesalahan pada form. Silakan muat ulang halaman.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Muat Ulang
                </button>
              </div>
            </div>
          </div>
        }
      >
        <WrappedComponent {...props} />
      </ComponentErrorBoundary>
    );
  };

  FormWithErrorBoundary.displayName = `withFormErrorBoundary(${componentName})`;
  return FormWithErrorBoundary;
}

/**
 * HOC for wrapping data components with error boundaries
 */
export function withDataErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const DataWithErrorBoundary = (props: P) => {
    const { handleError } = useGlobalErrorHandler();

    const handleDataError = (error: Error) => {
      const dataError = createError.ui(
        `Data error in ${componentName}: ${error.message}`,
        componentName
      );
      handleError(dataError, {
        component: componentName,
        action: 'data_loading',
      });
    };

    return (
      <SectionErrorBoundary
        onError={handleDataError}
        fallback={
          <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Data Loading Error
              </h3>
              <p className="text-gray-600 mb-4">
                Gagal memuat data. Silakan coba lagi.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        }
      >
        <WrappedComponent {...props} />
      </SectionErrorBoundary>
    );
  };

  DataWithErrorBoundary.displayName = `withDataErrorBoundary(${componentName})`;
  return DataWithErrorBoundary;
}

/**
 * HOC for wrapping navigation components with error boundaries
 */
export function withNavigationErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const NavigationWithErrorBoundary = (props: P) => {
    const { handleError } = useGlobalErrorHandler();

    const handleNavigationError = (error: Error) => {
      const navError = createError.ui(
        `Navigation error in ${componentName}: ${error.message}`,
        componentName
      );
      handleError(navError, {
        component: componentName,
        action: 'navigation',
      });
    };

    return (
      <ComponentErrorBoundary
        onError={handleNavigationError}
        fallback={
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-yellow-800">
                Navigasi mengalami masalah. Muat ulang halaman jika diperlukan.
              </span>
            </div>
          </div>
        }
      >
        <WrappedComponent {...props} />
      </ComponentErrorBoundary>
    );
  };

  NavigationWithErrorBoundary.displayName = `withNavigationErrorBoundary(${componentName})`;
  return NavigationWithErrorBoundary;
}

/**
 * Special error boundary for async operations
 */
export function AsyncErrorBoundary({ 
  children, 
  onError, 
  fallback 
}: {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
}) {
  return (
    <ComponentErrorBoundary
      onError={onError}
      fallback={fallback || (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600">Terjadi kesalahan saat memproses data</p>
          </div>
        </div>
      )}
    >
      {children}
    </ComponentErrorBoundary>
  );
}

export default {
  withFormErrorBoundary,
  withDataErrorBoundary,
  withNavigationErrorBoundary,
  AsyncErrorBoundary,
};
