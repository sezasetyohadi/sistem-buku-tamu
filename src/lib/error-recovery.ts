/**
 * Enhanced Error Recovery System
 * Provides retry mechanisms, error recovery strategies, and user-guided error resolution
 */

import { GlobalErrorHandler, createError, ErrorType, AppError, ErrorContext } from './error-handler';
import { showToast } from './toast';
import { logger } from './logger';

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  maxDelay?: number;
  retryCondition?: (error: AppError) => boolean;
}

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => Promise<void> | void;
  type: 'retry' | 'refresh' | 'redirect' | 'custom';
  priority: number;
}

export interface ErrorRecoveryOptions {
  showRecoveryActions?: boolean;
  autoRetry?: RetryConfig;
  customRecoveryActions?: RecoveryAction[];
  fallbackAction?: () => void;
}

/**
 * Enhanced Error Recovery Manager
 */
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private retryAttempts = new Map<string, number>();
  private recoveryQueue = new Map<string, ErrorRecoveryOptions>();

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  /**
   * Handle error with enhanced recovery options
   */
  async handleWithRecovery(
    error: Error | AppError,
    context?: ErrorContext,
    recoveryOptions?: ErrorRecoveryOptions
  ): Promise<void> {
    const errorHandler = GlobalErrorHandler.getInstance();
    const appError = this.normalizeError(error);
    const errorId = this.generateErrorId(appError, context);

    // Store recovery options for this error
    if (recoveryOptions) {
      this.recoveryQueue.set(errorId, recoveryOptions);
    }

    // Log enhanced error information
    logger.error('Error with recovery options:', {
      errorId,
      error: appError,
      context,
      recoveryOptions: recoveryOptions ? Object.keys(recoveryOptions) : null,
      retryAttempt: this.retryAttempts.get(errorId) || 0
    });

    // Check if we should auto-retry
    if (recoveryOptions?.autoRetry && this.shouldRetry(appError, errorId, recoveryOptions.autoRetry)) {
      await this.attemptAutoRetry(appError, context, errorId, recoveryOptions.autoRetry);
      return;
    }

    // Handle the error normally
    errorHandler.handleError(appError, context);

    // Show recovery actions if enabled
    if (recoveryOptions?.showRecoveryActions) {
      this.showRecoveryActions(appError, context, errorId, recoveryOptions);
    }
  }

  /**
   * Create error-specific retry mechanism
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    retryConfig: RetryConfig,
    errorContext?: ErrorContext
  ): Promise<T> {
    let lastError: AppError;
    let attempt = 0;

    while (attempt < retryConfig.maxAttempts) {
      try {
        if (attempt > 0) {
          const delay = this.calculateDelay(attempt, retryConfig);
          logger.info(`Retrying operation (attempt ${attempt + 1}/${retryConfig.maxAttempts}) after ${delay}ms`);
          await this.sleep(delay);
        }

        const result = await operation();
        
        // Success - clear any previous retry attempts
        if (attempt > 0) {
          logger.info(`Operation succeeded after ${attempt + 1} attempts`);
          showToast.success('Operasi berhasil setelah beberapa percobaan.');
        }
        
        return result;
      } catch (error) {
        attempt++;
        lastError = this.normalizeError(error as Error);

        logger.warn(`Operation failed (attempt ${attempt}/${retryConfig.maxAttempts}):`, {
          error: lastError,
          context: errorContext
        });

        // Check if we should continue retrying
        if (attempt >= retryConfig.maxAttempts || 
            (retryConfig.retryCondition && !retryConfig.retryCondition(lastError))) {
          break;
        }

        // Show progress toast for user feedback
        if (attempt < retryConfig.maxAttempts) {
          showToast.info(`Mencoba lagi... (${attempt}/${retryConfig.maxAttempts})`);
        }
      }
    }

    // All retries failed
    logger.error(`Operation failed after ${retryConfig.maxAttempts} attempts:`, {
      finalError: lastError!,
      context: errorContext
    });

    throw lastError!;
  }

  /**
   * Create circuit breaker pattern for failing operations
   */
  createCircuitBreaker<T>(
    operation: () => Promise<T>,
    config: {
      failureThreshold: number;
      resetTimeout: number;
      monitoringPeriod: number;
    }
  ) {
    let failures = 0;
    let lastFailureTime = 0;
    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    return async (): Promise<T> => {
      const now = Date.now();

      // Reset if monitoring period has passed
      if (now - lastFailureTime > config.monitoringPeriod) {
        failures = 0;
        state = 'CLOSED';
      }

      // Circuit is open - check if we should try again
      if (state === 'OPEN') {
        if (now - lastFailureTime < config.resetTimeout) {
          throw createError.network('Layanan sedang tidak stabil. Silakan tunggu beberapa saat.');
        }
        state = 'HALF_OPEN';
      }

      try {
        const result = await operation();
        
        // Success - reset circuit breaker
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failures = 0;
          logger.info('Circuit breaker reset - service recovered');
        }
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        if (failures >= config.failureThreshold) {
          state = 'OPEN';
          logger.warn(`Circuit breaker opened after ${failures} failures`);
          showToast.warning('Layanan sedang mengalami masalah. Mencoba pemulihan...');
        }

        throw error;
      }
    };
  }

  /**
   * Show interactive recovery actions to user
   */
  private showRecoveryActions(
    error: AppError,
    context: ErrorContext | undefined,
    errorId: string,
    options: ErrorRecoveryOptions
  ): void {
    const actions = this.buildRecoveryActions(error, context, errorId, options);
    
    if (actions.length === 0) return;

    // Custom toast with action buttons (simplified for now)
    showToast.error(`${error.message} - Tindakan pemulihan tersedia.`);
    
    // Execute primary recovery action after short delay
    if (actions.length > 0) {
      setTimeout(async () => {
        try {
          await actions[0].action();
          logger.info(`Auto-executed recovery action: ${actions[0].id}`);
        } catch (actionError) {
          logger.error(`Auto-recovery action failed: ${actions[0].id}`, actionError);
        }
      }, 2000);
    }
  }

  /**
   * Build context-appropriate recovery actions
   */
  private buildRecoveryActions(
    error: AppError,
    context: ErrorContext | undefined,
    errorId: string,
    options: ErrorRecoveryOptions
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Add standard recovery actions based on error type
    switch (error.type) {
      case ErrorType.NETWORK:
        actions.push({
          id: 'retry',
          label: 'Coba Lagi',
          description: 'Coba operasi sekali lagi',
          action: () => this.retryLastOperation(errorId),
          type: 'retry',
          priority: 1
        });
        break;

      case ErrorType.API:
        if (error.statusCode === 401) {
          actions.push({
            id: 'relogin',
            label: 'Login Ulang',
            description: 'Login kembali untuk memperbarui sesi',
            action: () => {
              window.location.href = '/admin/login';
            },
            type: 'redirect',
            priority: 1
          });
        } else {
          actions.push({
            id: 'retry',
            label: 'Coba Lagi',
            description: 'Coba operasi sekali lagi',
            action: () => this.retryLastOperation(errorId),
            type: 'retry',
            priority: 1
          });
        }
        break;

      case ErrorType.UI:
        actions.push({
          id: 'refresh',
          label: 'Muat Ulang',
          description: 'Muat ulang halaman untuk reset tampilan',
          action: () => window.location.reload(),
          type: 'refresh',
          priority: 1
        });
        break;
    }

    // Add custom recovery actions
    if (options.customRecoveryActions) {
      actions.push(...options.customRecoveryActions);
    }

    // Sort by priority
    return actions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check if error should be retried automatically
   */
  private shouldRetry(error: AppError, errorId: string, retryConfig: RetryConfig): boolean {
    const currentAttempts = this.retryAttempts.get(errorId) || 0;
    
    if (currentAttempts >= retryConfig.maxAttempts) {
      return false;
    }

    if (retryConfig.retryCondition && !retryConfig.retryCondition(error)) {
      return false;
    }

    // Don't auto-retry certain error types
    if (error.type === ErrorType.AUTH || error.type === ErrorType.VALIDATION) {
      return false;
    }

    return true;
  }

  /**
   * Attempt automatic retry with exponential backoff
   */
  private async attemptAutoRetry(
    error: AppError,
    context: ErrorContext | undefined,
    errorId: string,
    retryConfig: RetryConfig
  ): Promise<void> {
    const currentAttempts = this.retryAttempts.get(errorId) || 0;
    const nextAttempt = currentAttempts + 1;
    
    this.retryAttempts.set(errorId, nextAttempt);

    const delay = this.calculateDelay(nextAttempt, retryConfig);
    
    logger.info(`Auto-retrying operation (${nextAttempt}/${retryConfig.maxAttempts}) in ${delay}ms`, {
      errorId,
      error: error.type
    });

    showToast.info(`Mencoba kembali dalam ${Math.round(delay / 1000)} detik... (${nextAttempt}/${retryConfig.maxAttempts})`);

    await this.sleep(delay);

    // The actual retry would be handled by the calling code
    // This just tracks the attempt and provides user feedback
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const multiplier = config.backoffMultiplier || 2;
    const delay = config.delay * Math.pow(multiplier, attempt - 1);
    return Math.min(delay, config.maxDelay || 30000);
  }

  /**
   * Generate unique error ID for tracking
   */
  private generateErrorId(error: AppError, context?: ErrorContext): string {
    const timestamp = Date.now();
    const errorType = error.type || 'unknown';
    const contextHash = context ? this.hashContext(context) : 'no-context';
    return `${errorType}_${contextHash}_${timestamp}`;
  }

  /**
   * Create simple hash of context for error ID
   */
  private hashContext(context: ErrorContext): string {
    const str = JSON.stringify(context);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Normalize error to AppError format
   */
  private normalizeError(error: Error): AppError {
    if ('type' in error && error.type) {
      return error as AppError;
    }

    return createError.api(error.message, 500, 'UNKNOWN_ERROR', {
      originalError: error.name,
      stack: error.stack
    });
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Placeholder for retrying last operation
   */
  private async retryLastOperation(errorId: string): Promise<void> {
    // This would need to be implemented based on the specific operation
    // For now, just show feedback
    showToast.info('Mencoba operasi kembali...');
    
    // Clear retry attempts for this error
    this.retryAttempts.delete(errorId);
  }

  /**
   * Clear all retry tracking data
   */
  clearRetryHistory(): void {
    this.retryAttempts.clear();
    this.recoveryQueue.clear();
  }

  /**
   * Get retry statistics
   */
  getRetryStats(): {
    activeRetries: number;
    totalErrors: number;
    avgRetriesPerError: number;
  } {
    const totalErrors = this.retryAttempts.size;
    const totalRetries = Array.from(this.retryAttempts.values()).reduce((sum, count) => sum + count, 0);
    
    return {
      activeRetries: totalErrors,
      totalErrors,
      avgRetriesPerError: totalErrors > 0 ? totalRetries / totalErrors : 0
    };
  }
}

/**
 * Default retry configurations for common scenarios
 */
export const RetryConfigs = {
  network: {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    retryCondition: (error: AppError) => error.type === ErrorType.NETWORK
  },
  
  api: {
    maxAttempts: 2,
    delay: 500,
    backoffMultiplier: 2,
    maxDelay: 5000,
    retryCondition: (error: AppError) => 
      error.type === ErrorType.API && 
      error.statusCode !== undefined && 
      error.statusCode >= 500
  },
  
  database: {
    maxAttempts: 3,
    delay: 2000,
    backoffMultiplier: 1.5,
    maxDelay: 8000,
    retryCondition: (error: AppError) => error.type === ErrorType.DATABASE
  }
};

/**
 * React hook for enhanced error handling with recovery
 */
export function useErrorRecovery() {
  const recoveryManager = ErrorRecoveryManager.getInstance();

  return {
    handleWithRecovery: recoveryManager.handleWithRecovery.bind(recoveryManager),
    retryOperation: recoveryManager.retryOperation.bind(recoveryManager),
    createCircuitBreaker: recoveryManager.createCircuitBreaker.bind(recoveryManager),
    clearHistory: recoveryManager.clearRetryHistory.bind(recoveryManager),
    getStats: recoveryManager.getRetryStats.bind(recoveryManager)
  };
}

// Export singleton instance
export const errorRecovery = ErrorRecoveryManager.getInstance();
