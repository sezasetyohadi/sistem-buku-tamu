/**
 * Data Fetching Hooks with Loading States
 * Provides reusable hooks for API calls with built-in loading, error, and caching
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadingState } from '@/components/ui/LoadingState';

/**
 * Generic API Response Type
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: any;
}

/**
 * Fetch State Interface
 */
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: Date | null;
}

/**
 * Use Fetch Hook Options
 */
interface UseFetchOptions {
  immediate?: boolean;
  cache?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number;
  loadingKey?: string;
}

/**
 * Simple cache implementation
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; duration: number }>();

  set(key: string, data: any, duration: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.duration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

const cache = new SimpleCache();

/**
 * Generic fetch hook
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const {
    immediate = true,
    cache: useCache = false,
    cacheKey = '',
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    retryAttempts = 0,
    retryDelay = 1000,
    loadingKey,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  const loadingState = loadingKey ? useLoadingState(loadingKey) : null;
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(async (attempt = 0): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Check cache first
    if (useCache && cacheKey) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
        }));
        return cachedData;
      }
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      loadingState?.startLoading();

      const result = await fetchFn();

      // Cache the result
      if (useCache && cacheKey) {
        cache.set(cacheKey, result, cacheDuration);
      }

      setState({
        data: result,
        loading: false,
        error: null,
        lastFetch: new Date(),
      });

      loadingState?.stopLoading();
      return result;

    } catch (error) {
      const err = error as Error;

      // Don't update state if request was aborted
      if (err.name === 'AbortError') {
        return null;
      }

      // Retry logic
      if (attempt < retryAttempts) {
        retryTimeoutRef.current = setTimeout(() => {
          execute(attempt + 1);
        }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
        return null;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
      }));

      loadingState?.stopLoading();
      throw err;
    }
  }, [fetchFn, useCache, cacheKey, cacheDuration, retryAttempts, retryDelay, loadingState]);

  const refresh = useCallback(() => {
    // Clear cache if using cache
    if (useCache && cacheKey) {
      cache.clear(cacheKey);
    }
    return execute();
  }, [execute, useCache, cacheKey]);

  const reset = useCallback(() => {
    // Cancel ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null,
    });

    loadingState?.stopLoading();
  }, [loadingState]);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    refresh,
    reset,
    isStale: state.lastFetch ? Date.now() - state.lastFetch.getTime() > cacheDuration : false,
  };
}

/**
 * Hook for API calls
 */
export function useApiCall<T>(
  url: string,
  options: RequestInit & UseFetchOptions = {}
) {
  const { immediate, cache, cacheKey, cacheDuration, retryAttempts, retryDelay, loadingKey, ...fetchOptions } = options;

  const fetchFn = useCallback(async (): Promise<T> => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API call failed');
    }

    return data.data as T;
  }, [url, fetchOptions]);

  return useFetch(fetchFn, {
    immediate,
    cache,
    cacheKey: cacheKey || url,
    cacheDuration,
    retryAttempts,
    retryDelay,
    loadingKey,
  });
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    loadingKey?: string;
  } = {}
) {
  const { onSuccess, onError, loadingKey } = options;
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const loadingState = loadingKey ? useLoadingState(loadingKey) : null;

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      loadingState?.startLoading();

      const result = await mutationFn(variables);

      setState({
        data: result,
        loading: false,
        error: null,
      });

      loadingState?.stopLoading();
      onSuccess?.(result, variables);
      return result;

    } catch (error) {
      const err = error as Error;
      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
      }));

      loadingState?.stopLoading();
      onError?.(err, variables);
      throw err;
    }
  }, [mutationFn, onSuccess, onError, loadingState]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
    loadingState?.stopLoading();
  }, [loadingState]);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * Hook for paginated data
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, limit: number) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>,
  options: {
    initialPage?: number;
    initialLimit?: number;
    loadingKey?: string;
  } = {}
) {
  const { initialPage = 1, initialLimit = 10, loadingKey } = options;
  
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  
  const fetchData = useCallback(() => {
    return fetchFn(page, limit);
  }, [fetchFn, page, limit]);

  const {
    data: response,
    loading,
    error,
    execute,
    refresh,
  } = useFetch(fetchData, {
    immediate: true,
    loadingKey,
  });

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (response?.pagination.hasNext) {
      setPage(prev => prev + 1);
    }
  }, [response?.pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (response?.pagination.hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [response?.pagination.hasPrev]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    data: response?.data || [],
    pagination: response?.pagination || null,
    loading,
    error,
    page,
    limit,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    refresh,
  };
}

/**
 * Hook for infinite scroll data
 */
export function useInfiniteData<T>(
  fetchFn: (page: number, limit: number) => Promise<{
    data: T[];
    hasMore: boolean;
  }>,
  options: {
    initialLimit?: number;
    loadingKey?: string;
  } = {}
) {
  const { initialLimit = 10, loadingKey } = options;
  
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  const loadingState = loadingKey ? useLoadingState(loadingKey) : null;
  
  const {
    loading,
    error,
    execute,
  } = useFetch(
    () => fetchFn(page, initialLimit),
    {
      immediate: false,
      loadingKey,
    }
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      const result = await execute();
      if (result) {
        setAllData(prev => [...prev, ...result.data]);
        setHasMore(result.hasMore);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      // Error is handled by the useFetch hook
    }
  }, [loading, hasMore, execute]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  // Load initial data
  useEffect(() => {
    loadMore();
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}

export default {
  useFetch,
  useApiCall,
  useMutation,
  usePaginatedData,
  useInfiniteData,
};
