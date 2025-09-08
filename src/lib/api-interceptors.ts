/**
 * API Error Interceptors
 * Integrates error handling with data fetching hooks and API calls
 */

import { GlobalErrorHandler, createError, ErrorType } from './error-handler';
import { ErrorRecoveryManager, RetryConfigs } from './error-recovery';
import { showToast } from './toast';
import { logger } from './logger';

export interface ApiErrorInterceptorConfig {
  enableRetry: boolean;
  enableRecovery: boolean;
  enableCircuitBreaker: boolean;
  baseURL?: string;
  timeout?: number;
}

export interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryConfig?: {
    maxAttempts: number;
    delay: number;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Enhanced Fetch with Error Handling and Recovery
 */
export class ApiClient {
  private static instance: ApiClient;
  private config: ApiErrorInterceptorConfig;
  private errorHandler: GlobalErrorHandler;
  private recoveryManager: ErrorRecoveryManager;
  private circuitBreakers = new Map<string, any>();

  constructor(config: ApiErrorInterceptorConfig = {
    enableRetry: true,
    enableRecovery: true,
    enableCircuitBreaker: true,
    timeout: 10000
  }) {
    this.config = config;
    this.errorHandler = GlobalErrorHandler.getInstance();
    this.recoveryManager = ErrorRecoveryManager.getInstance();
  }

  static getInstance(config?: ApiErrorInterceptorConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  /**
   * Enhanced fetch with automatic error handling and recovery
   */
  async fetch<T = any>(requestConfig: RequestConfig): Promise<ApiResponse<T>> {
    const { url, method, headers = {}, body, timeout = this.config.timeout } = requestConfig;
    
    // Create unique key for circuit breaker
    const operationKey = `${method.toUpperCase()}_${url}`;
    
    // Get or create circuit breaker for this operation
    let operation = this.circuitBreakers.get(operationKey);
    if (!operation && this.config.enableCircuitBreaker) {
      operation = this.recoveryManager.createCircuitBreaker(
        () => this.executeRequest<T>(requestConfig),
        {
          failureThreshold: 5,
          resetTimeout: 60000,
          monitoringPeriod: 300000
        }
      );
      this.circuitBreakers.set(operationKey, operation);
    }

    try {
      // Execute request with retry if enabled
      if (this.config.enableRetry && requestConfig.retryConfig) {
        return await this.recoveryManager.retryOperation(
          operation || (() => this.executeRequest<T>(requestConfig)),
          {
            maxAttempts: requestConfig.retryConfig.maxAttempts,
            delay: requestConfig.retryConfig.delay,
            backoffMultiplier: 2,
            retryCondition: (error) => this.shouldRetryRequest(error)
          },
          {
            action: `${method.toUpperCase()} ${url}`,
            url
          }
        );
      } else {
        return operation ? await operation() : await this.executeRequest<T>(requestConfig);
      }
    } catch (error) {
      return this.handleRequestError<T>(error, requestConfig);
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { url, method, headers = {}, body, timeout = this.config.timeout } = config;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        throw await this.createResponseError(response, config);
      }

      // Parse response
      const data = await this.parseResponse<T>(response);
      
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw createError.network('Request timeout', {
          url,
          method,
          timeout
        });
      }
      
      throw error;
    }
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('text/')) {
      return response.text() as any;
    } else {
      return response.blob() as any;
    }
  }

  /**
   * Parse response headers to object
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    return headerObj;
  }

  /**
   * Create structured error from failed response
   */
  private async createResponseError(response: Response, config: RequestConfig): Promise<Error> {
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: response.statusText };
    }

    return createError.api(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.code || `HTTP_${response.status}`,
      {
        url: config.url,
        method: config.method,
        responseData: errorData,
        headers: this.parseHeaders(response.headers)
      }
    );
  }

  /**
   * Handle request errors with recovery options
   */
  private async handleRequestError<T>(error: any, config: RequestConfig): Promise<never> {
    const context = {
      action: `${config.method.toUpperCase()} ${config.url}`,
      url: config.url,
      method: config.method
    };

    if (this.config.enableRecovery) {
      await this.recoveryManager.handleWithRecovery(error, context, {
        showRecoveryActions: true,
        autoRetry: this.config.enableRetry ? RetryConfigs.api : undefined,
        customRecoveryActions: this.createRequestRecoveryActions(config)
      });
    } else {
      this.errorHandler.handleError(error, context);
    }

    throw error;
  }

  /**
   * Create context-specific recovery actions for requests
   */
  private createRequestRecoveryActions(config: RequestConfig) {
    const actions = [];

    // Add refresh action for GET requests
    if (config.method.toUpperCase() === 'GET') {
      actions.push({
        id: 'refresh_data',
        label: 'Muat Ulang Data',
        description: 'Muat ulang data dari server',
        action: async () => {
          showToast.info('Memuat ulang data...');
          // The actual retry would be handled by the calling component
        },
        type: 'retry' as const,
        priority: 1
      });
    }

    // Add general retry action
    actions.push({
      id: 'retry_request',
      label: 'Coba Lagi',
      description: 'Coba permintaan sekali lagi',
      action: async () => {
        showToast.info('Mencoba permintaan lagi...');
        // The actual retry would be handled by the calling component
      },
      type: 'retry' as const,
      priority: 2
    });

    return actions;
  }

  /**
   * Determine if a request should be retried
   */
  private shouldRetryRequest(error: any): boolean {
    // Don't retry client errors (4xx except specific cases)
    if (error.statusCode >= 400 && error.statusCode < 500) {
      // Retry only for specific 4xx errors
      return error.statusCode === 408 || error.statusCode === 429;
    }

    // Retry server errors (5xx)
    if (error.statusCode >= 500) {
      return true;
    }

    // Retry network errors
    if (error.type === ErrorType.NETWORK) {
      return true;
    }

    return false;
  }

  /**
   * Convenience methods for different HTTP methods
   */
  async get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.fetch<T>({
      url,
      method: 'GET',
      retryConfig: { maxAttempts: 3, delay: 1000 },
      ...config
    });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.fetch<T>({
      url,
      method: 'POST',
      body: data,
      retryConfig: { maxAttempts: 2, delay: 500 },
      ...config
    });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.fetch<T>({
      url,
      method: 'PUT',
      body: data,
      retryConfig: { maxAttempts: 2, delay: 500 },
      ...config
    });
  }

  async delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.fetch<T>({
      url,
      method: 'DELETE',
      retryConfig: { maxAttempts: 1, delay: 1000 },
      ...config
    });
  }

  /**
   * Get circuit breaker statistics
   */
  getCircuitBreakerStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    this.circuitBreakers.forEach((breaker, key) => {
      stats[key] = {
        // Circuit breaker stats would go here
        // This is a placeholder since we can't access internal state
        key,
        created: true
      };
    });
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }
}

/**
 * Integration with useDataFetching hooks
 */
export function createEnhancedFetchFunction() {
  const apiClient = ApiClient.getInstance();

  return async (url: string, options?: RequestInit) => {
    const method = options?.method || 'GET';
    
    try {
      const response = await apiClient.fetch({
        url,
        method,
        headers: options?.headers as Record<string, string>,
        body: options?.body,
        retryConfig: {
          maxAttempts: 3,
          delay: 1000
        }
      });

      // Convert to standard Response object for compatibility
      return new Response(JSON.stringify(response.data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      // Convert error back to fetch-compatible error
      if (error && typeof error === 'object' && 'statusCode' in error && 'message' in error) {
        const appError = error as { statusCode: number; message: string };
        const response = new Response(JSON.stringify({ error: appError.message }), {
          status: appError.statusCode,
          statusText: appError.message
        });
        return response;
      }
      throw error;
    }
  };
}

/**
 * React hook for API operations with enhanced error handling
 */
export function useApiClient() {
  const apiClient = ApiClient.getInstance();

  return {
    get: apiClient.get.bind(apiClient),
    post: apiClient.post.bind(apiClient),
    put: apiClient.put.bind(apiClient),
    delete: apiClient.delete.bind(apiClient),
    getStats: apiClient.getCircuitBreakerStats.bind(apiClient),
    resetCircuitBreakers: apiClient.resetCircuitBreakers.bind(apiClient)
  };
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
