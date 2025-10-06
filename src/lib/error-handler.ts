/**
 * Global Error Handler Utilities
 * Handles different types of errors across the application
 */

import { logger } from '@/lib/logger';
import { showToast } from '@/lib/toast';

// Error types enum
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API', 
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  UI = 'UI',
  UNKNOWN = 'UNKNOWN'
}

// Standard error interface
export interface AppError extends Error {
  type?: ErrorType;
  code?: string;
  statusCode?: number;
  details?: any;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

// Error context for better debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  additionalData?: any;
}

/**
 * Global Error Handler Class
 */
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  /**
   * Setup global error handlers for unhandled errors
   */
  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        // Filter out hydration-related promise rejections
        const reasonString = String(event.reason);
        const isHydrationRelated = reasonString.includes('Hydration') || 
                                   reasonString.includes('hydration') ||
                                   reasonString.includes('server rendered') ||
                                   reasonString.includes('text didn\'t match');
        
        if (!isHydrationRelated) {
          logger.error('Unhandled promise rejection:', {
            reason: event.reason,
            promise: event.promise,
            url: window.location.href,
            userAgent: navigator.userAgent,
          });
          
          // Show user-friendly message
          showToast.error('Terjadi kesalahan tidak terduga. Silakan coba lagi.');
        }

        // Prevent default browser error handling
        event.preventDefault();
      });

      // Handle general JavaScript errors
      window.addEventListener('error', (event) => {
        // Filter out hydration and development-only errors
        const isHydrationError = event.message && (
          event.message.includes('Hydration failed') ||
          event.message.includes('hydration') ||
          event.message.includes('server rendered text')
        );
        
        const isScriptError = event.message && event.message.includes('Script error');
        const isNextDevError = event.filename && event.filename.includes('_next');
        
        // Only log non-hydration, non-script, non-Next.js development errors
        if (!isHydrationError && !isScriptError && !isNextDevError && event.message) {
          logger.error('Global JavaScript error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error ? event.error.message : null,
            url: window.location.href,
          });
          
          // Show user-friendly message for unexpected errors
          showToast.error('Terjadi kesalahan pada halaman. Silakan muat ulang.');
        }
      });
    }
  }

  /**
   * Handle different types of errors with appropriate responses
   */
  handleError(error: Error | AppError, context?: ErrorContext): void {
    const appError = this.normalizeError(error);
    const errorContext = this.enrichContext(context);

    // Log the error with full context
    logger.error('Application error handled:', {
      type: appError.type,
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: appError.stack,
      context: errorContext,
      timestamp: appError.timestamp,
    });

    // Handle based on error type
    switch (appError.type) {
      case ErrorType.NETWORK:
        this.handleNetworkError(appError, errorContext);
        break;
      case ErrorType.API:
        this.handleApiError(appError, errorContext);
        break;
      case ErrorType.VALIDATION:
        this.handleValidationError(appError, errorContext);
        break;
      case ErrorType.AUTH:
        this.handleAuthError(appError, errorContext);
        break;
      case ErrorType.DATABASE:
        this.handleDatabaseError(appError, errorContext);
        break;
      case ErrorType.UI:
        this.handleUIError(appError, errorContext);
        break;
      default:
        this.handleUnknownError(appError, errorContext);
        break;
    }
  }

  private normalizeError(error: Error | AppError): AppError {
    const appError = error as AppError;
    
    return {
      ...appError,
      type: appError.type || ErrorType.UNKNOWN,
      timestamp: appError.timestamp || new Date().toISOString(),
      code: appError.code || 'UNKNOWN_ERROR',
    };
  }

  private enrichContext(context?: ErrorContext): ErrorContext {
    const baseContext: ErrorContext = {
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: new Date().toISOString(),
    };

    return { ...baseContext, ...context };
  }

  private handleNetworkError(error: AppError, context: ErrorContext): void {
    if (navigator.onLine === false) {
      showToast.error('Tidak ada koneksi internet. Periksa koneksi Anda.');
    } else {
      showToast.error('Gagal terhubung ke server. Silakan coba lagi.');
    }
  }

  private handleApiError(error: AppError, context: ErrorContext): void {
    const statusCode = error.statusCode || 500;
    
    switch (statusCode) {
      case 400:
        showToast.validation('Permintaan tidak valid. Periksa data yang dikirim.');
        break;
      case 401:
        showToast.sessionTimeout('Sesi Anda telah berakhir. Silakan login kembali.');
        // Could trigger redirect to login
        break;
      case 403:
        showToast.error('Anda tidak memiliki akses untuk operasi ini.');
        break;
      case 404:
        showToast.error('Data yang dicari tidak ditemukan.');
        break;
      case 422:
        showToast.validation('Data tidak valid. Periksa input Anda.');
        break;
      case 429:
        showToast.warning('Terlalu banyak permintaan. Silakan tunggu sebentar.');
        break;
      case 500:
        showToast.error('Terjadi kesalahan server. Silakan coba lagi nanti.');
        break;
      case 503:
        showToast.error('Layanan sedang tidak tersedia. Silakan coba lagi nanti.');
        break;
      default:
        showToast.error('Terjadi kesalahan pada server.');
        break;
    }
  }

  private handleValidationError(error: AppError, context: ErrorContext): void {
    const message = error.details?.message || error.message || 'Data tidak valid';
    showToast.validation(message);
  }

  private handleAuthError(error: AppError, context: ErrorContext): void {
    showToast.sessionTimeout('Sesi Anda telah berakhir. Silakan login kembali.');
    
    // Could implement automatic redirect to login
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          window.location.href = '/admin/login';
        }
      }, 2000);
    }
  }

  private handleDatabaseError(error: AppError, context: ErrorContext): void {
    logger.error('Database error:', { error, context });
    showToast.error('Terjadi masalah pada database. Silakan coba lagi.');
  }

  private handleUIError(error: AppError, context: ErrorContext): void {
    showToast.error('Terjadi kesalahan pada tampilan. Silakan muat ulang halaman.');
  }

  private handleUnknownError(error: AppError, context: ErrorContext): void {
    logger.error('Unknown error type:', { error, context });
    showToast.error('Terjadi kesalahan tidak terduga. Silakan coba lagi.');
  }
}

/**
 * Utility functions for creating specific error types
 */
export const createError = {
  network: (message: string, details?: any): AppError => ({
    name: 'NetworkError',
    message,
    type: ErrorType.NETWORK,
    details,
    timestamp: new Date().toISOString(),
  }),

  api: (message: string, statusCode: number, code?: string, details?: any): AppError => ({
    name: 'APIError',
    message,
    type: ErrorType.API,
    statusCode,
    code,
    details,
    timestamp: new Date().toISOString(),
  }),

  validation: (message: string, details?: any): AppError => ({
    name: 'ValidationError',
    message,
    type: ErrorType.VALIDATION,
    details,
    timestamp: new Date().toISOString(),
  }),

  auth: (message: string, code?: string): AppError => ({
    name: 'AuthError',
    message,
    type: ErrorType.AUTH,
    code,
    timestamp: new Date().toISOString(),
  }),

  database: (message: string, details?: any): AppError => ({
    name: 'DatabaseError',
    message,
    type: ErrorType.DATABASE,
    details,
    timestamp: new Date().toISOString(),
  }),

  ui: (message: string, component?: string): AppError => ({
    name: 'UIError',
    message,
    type: ErrorType.UI,
    details: { component },
    timestamp: new Date().toISOString(),
  }),
};

/**
 * Error handler hook for React components
 */
export function useGlobalErrorHandler() {
  const errorHandler = GlobalErrorHandler.getInstance();

  return {
    handleError: (error: Error | AppError, context?: ErrorContext) => {
      errorHandler.handleError(error, context);
    },
    createError,
  };
}

/**
 * API Error interceptor utility
 */
export function createApiErrorInterceptor() {
  return {
    request: (config: any) => {
      // Add request context
      return config;
    },
    
    response: (response: any) => {
      return response;
    },
    
    error: (error: any) => {
      const errorHandler = GlobalErrorHandler.getInstance();
      
      if (error.response) {
        // Server responded with error status
        const apiError = createError.api(
          error.response.data?.message || 'Server error',
          error.response.status,
          error.response.data?.code,
          error.response.data
        );
        
        errorHandler.handleError(apiError, {
          url: error.config?.url,
          action: error.config?.method?.toUpperCase(),
        });
      } else if (error.request) {
        // Network error
        const networkError = createError.network(
          'Gagal terhubung ke server',
          { request: error.request }
        );
        
        errorHandler.handleError(networkError);
      } else {
        // Other error
        errorHandler.handleError(error);
      }
      
      return Promise.reject(error);
    },
  };
}

// Initialize global error handler on module load
if (typeof window !== 'undefined') {
  GlobalErrorHandler.getInstance();
}

export default GlobalErrorHandler;
