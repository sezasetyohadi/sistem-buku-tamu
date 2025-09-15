/**
 * Enhanced React Error Boundary Components
 * Provides graceful error handling and recovery for the application with comprehensive error reporting
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

import { createError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { showToast } from '@/lib/toast';

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

// Props for the error boundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showToast?: boolean;
  level?: 'page' | 'section' | 'component';
}

/**
 * Main Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, showToast: showToastProp = true, level = 'component' } = this.props;
    
    // Enhanced error reporting with recovery system
    const errorContext = {
      componentStack: errorInfo.componentStack,
      stack: error.stack,
      message: error.message,
      name: error.name,
      level,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    };

    // Create structured error
    const structuredError = createError.ui(
      error.message,
      `${level}-error-boundary`
    );

    // Report error to recovery system
    try {
      // Send error report for analytics
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...structuredError,
          context: errorContext
        })
      }).catch(e => logger.error('Failed to report error:', e));
    } catch (reportError) {
      logger.error('Error reporting failed:', reportError);
    }

    // Log detailed error information
    logger.error('Error Boundary caught an error:', errorContext);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in custom error handler:', handlerError);
      }
    }

    // Show toast notification for user feedback with recovery guidance
    if (showToastProp) {
      const levelMessages = {
        page: 'Terjadi kesalahan pada halaman ini. Silakan muat ulang halaman.',
        section: 'Terjadi kesalahan pada bagian ini. Mencoba memuat ulang...',
        component: 'Terjadi kesalahan pada komponen. Silakan coba lagi.',
      };

      showToast.error(levelMessages[level]);
    }

    // Auto-retry for component-level errors after 5 seconds
    if (level === 'component') {
      this.resetTimeoutId = setTimeout(() => {
        this.handleReset();
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    logger.info('Error boundary reset', { level: this.props.level });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI based on level
      return (
        <ErrorFallbackUI
          error={error}
          errorId={errorId}
          level={level}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      );
    }

    return children;
  }
}

/**
 * Error Fallback UI Components
 */
interface ErrorFallbackProps {
  error: Error;
  errorId: string | null;
  level: 'page' | 'section' | 'component';
  onReset: () => void;
  onReload: () => void;
}

const ErrorFallbackUI: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  level,
  onReset,
  onReload,
}) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const levelStyles = {
    page: 'min-h-screen bg-gray-50',
    section: 'min-h-96 bg-gray-50 rounded-lg',
    component: 'min-h-32 bg-gray-100 rounded',
  };

  const levelTitles = {
    page: 'Oops! Terjadi Kesalahan',
    section: 'Bagian Tidak Dapat Dimuat',
    component: 'Komponen Error',
  };

  const levelDescriptions = {
    page: 'Halaman ini mengalami masalah. Kami mohon maaf atas ketidaknyamanan ini.',
    section: 'Bagian ini tidak dapat dimuat dengan benar. Silakan coba lagi.',
    component: 'Komponen ini mengalami masalah. Mencoba memuat ulang otomatis...',
  };

  return (
    <div className={`flex items-center justify-center p-6 ${levelStyles[level]}`}>
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mx-auto mb-4">
          {level === 'page' ? (
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : level === 'section' ? (
            <svg className="w-12 h-12 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 mx-auto text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>

        {/* Error Title */}
        <h2 className={`font-bold text-gray-900 mb-2 ${
          level === 'page' ? 'text-2xl' : level === 'section' ? 'text-xl' : 'text-lg'
        }`}>
          {levelTitles[level]}
        </h2>

        {/* Error Description */}
        <p className={`text-gray-600 mb-4 ${
          level === 'page' ? 'text-base' : 'text-sm'
        }`}>
          {levelDescriptions[level]}
        </p>

        {/* Error Details (Development Only) */}
        {!isProduction && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Detail Error (Development)
            </summary>
            <div className="mt-2 p-3 bg-red-50 rounded text-xs text-red-800 font-mono overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error ID:</strong> {errorId}
              </div>
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {level !== 'component' && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Coba Lagi
            </button>
          )}
          
          {level === 'page' && (
            <button
              onClick={onReload}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
            >
              Muat Ulang Halaman
            </button>
          )}

          {level === 'component' && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memuat ulang dalam 5 detik...
            </div>
          )}
        </div>

        {/* Help Text */}
        {level === 'page' && (
          <p className="mt-4 text-sm text-gray-500">
            Jika masalah berlanjut, silakan hubungi administrator sistem.
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Higher-Order Component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for manually triggering error boundaries (for testing or error reporting)
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    // Log error details
    logger.error('Manual error triggered:', {
      error: error.message,
      stack: error.stack,
      additionalInfo: errorInfo,
    });

    // Re-throw error to be caught by error boundary
    throw error;
  };
}

/**
 * Specialized Error Boundaries for specific contexts
 */

// Page-level error boundary
export const PageErrorBoundary: React.FC<{ 
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}> = ({ children, onError, fallback }) => (
  <ErrorBoundary level="page" showToast={true} onError={onError} fallback={fallback}>
    {children}
  </ErrorBoundary>
);

// Section-level error boundary
export const SectionErrorBoundary: React.FC<{ 
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}> = ({ children, onError, fallback }) => (
  <ErrorBoundary level="section" showToast={true} onError={onError} fallback={fallback}>
    {children}
  </ErrorBoundary>
);

// Component-level error boundary
export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}> = ({ children, onError, fallback }) => (
  <ErrorBoundary level="component" showToast={false} onError={onError} fallback={fallback}>
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
