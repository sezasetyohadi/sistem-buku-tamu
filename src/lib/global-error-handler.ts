/**
 * Global Error Handler
 * Handles unhandled promise rejections and uncaught exceptions
 */

import { ErrorLogger } from '@/lib/error-handling';
import { logger } from '@/lib/logger';

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private initialized = false;

  private constructor() {}

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    if (typeof process !== 'undefined') {
      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
        logger.error('Unhandled Promise Rejection', {
          operation: 'UNHANDLED_REJECTION',
          metadata: {
            reason: reason?.toString(),
            stack: reason?.stack
          }
        });

        ErrorLogger.logError(
          reason instanceof Error ? reason : new Error(String(reason))
        );

        // In production, you might want to gracefully shutdown
        if (process.env.NODE_ENV === 'production') {
          // Log the error and continue running
          logger.error('Application continuing after unhandled rejection');
        }
      });

      // Handle uncaught exceptions
      process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught Exception', {
          operation: 'UNCAUGHT_EXCEPTION',
          metadata: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        });

        ErrorLogger.logError(error);

        // For uncaught exceptions, it's safer to exit
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      });

      // Handle warnings
      process.on('warning', (warning: Error) => {
        logger.warn('Process Warning', {
          operation: 'PROCESS_WARNING',
          metadata: {
            name: warning.name,
            message: warning.message,
            stack: warning.stack
          }
        });
      });
    }

    // Handle window errors (client-side)
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event: ErrorEvent) => {
        logger.error('Window Error', {
          operation: 'WINDOW_ERROR',
          metadata: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });

        ErrorLogger.logError(
          event.error || new Error(event.message)
        );
      });

      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        logger.error('Unhandled Promise Rejection (Client)', {
          operation: 'CLIENT_UNHANDLED_REJECTION',
          metadata: {
            reason: event.reason?.toString()
          }
        });

        ErrorLogger.logError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason))
        );

        // Prevent the default behavior (logging to console)
        event.preventDefault();
      });
    }

    this.initialized = true;
    logger.info('Global error handler initialized');
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Auto-initialize in appropriate environments
if (typeof process !== 'undefined' || typeof window !== 'undefined') {
  globalErrorHandler.initialize();
}

export default globalErrorHandler;
