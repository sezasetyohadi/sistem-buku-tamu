/**
 * Loading State Management
 * Provides global loading state management and Suspense boundaries
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PageLoading, LoadingOverlay } from './Loading';

/**
 * Loading State Interface
 */
interface LoadingState {
  [key: string]: boolean;
}

/**
 * Loading Context Interface
 */
interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearLoading: () => void;
}

/**
 * Loading Context
 */
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Loading Provider Component
 */
interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const clearLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const value: LoadingContextType = {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    clearLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

/**
 * Hook to use loading context
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

/**
 * Hook for managing individual loading states
 */
export const useLoadingState = (key: string) => {
  const { setLoading, isLoading } = useLoading();

  const startLoading = useCallback(() => {
    setLoading(key, true);
  }, [key, setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(key, false);
  }, [key, setLoading]);

  const toggleLoading = useCallback(() => {
    setLoading(key, !isLoading(key));
  }, [key, setLoading, isLoading]);

  return {
    isLoading: isLoading(key),
    startLoading,
    stopLoading,
    toggleLoading,
  };
};

/**
 * Suspense Boundary with Custom Fallback
 */
interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback,
  name = 'content',
}) => {
  const defaultFallback = <PageLoading text={`Loading ${name}...`} />;

  return (
    <React.Suspense fallback={fallback || defaultFallback}>
      {children}
    </React.Suspense>
  );
};

/**
 * Section Suspense Boundary
 */
interface SectionSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  name?: string;
}

export const SectionSuspense: React.FC<SectionSuspenseProps> = ({
  children,
  fallback,
  className = '',
  name = 'section',
}) => {
  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <PageLoading text={`Loading ${name}...`} />
    </div>
  );

  return (
    <React.Suspense fallback={fallback || defaultFallback}>
      {children}
    </React.Suspense>
  );
};

/**
 * Loading Wrapper Component
 */
interface LoadingWrapperProps {
  children: ReactNode;
  isLoading: boolean;
  loadingComponent?: ReactNode;
  error?: Error | null;
  errorComponent?: ReactNode;
  isEmpty?: boolean;
  emptyComponent?: ReactNode;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  isLoading,
  loadingComponent,
  error,
  errorComponent,
  isEmpty = false,
  emptyComponent,
  className = '',
}) => {
  if (error) {
    return (
      <div className={`error-state ${className}`}>
        {errorComponent || (
          <div className="text-center p-8">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600">{error.message || 'An unexpected error occurred'}</p>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`loading-state ${className}`}>
        {loadingComponent || <PageLoading />}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`empty-state ${className}`}>
        {emptyComponent || (
          <div className="text-center p-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
            <p className="text-gray-600">There's nothing to display at the moment</p>
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

/**
 * HOC for adding loading states to components
 */
export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  loadingKey: string
) {
  const ComponentWithLoading = (props: P) => {
    const { isLoading } = useLoadingState(loadingKey);

    return (
      <LoadingOverlay isLoading={isLoading}>
        <WrappedComponent {...props} />
      </LoadingOverlay>
    );
  };

  ComponentWithLoading.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithLoading;
}

/**
 * Async Component Loader
 */
interface AsyncComponentProps<T> {
  loadFn: () => Promise<T>;
  children: (data: T) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error) => ReactNode;
  deps?: any[];
}

export function AsyncComponent<T>({
  loadFn,
  children,
  loadingComponent,
  errorComponent,
  deps = [],
}: AsyncComponentProps<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await loadFn();
        
        if (!cancelled) {
          setState({
            data: result,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error as Error,
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, deps);

  if (state.loading) {
    return <>{loadingComponent || <PageLoading />}</>;
  }

  if (state.error) {
    return <>{errorComponent ? errorComponent(state.error) : <div>Error: {state.error.message}</div>}</>;
  }

  if (state.data === null) {
    return <div>No data</div>;
  }

  return <>{children(state.data)}</>;
}

export default {
  LoadingProvider,
  useLoading,
  useLoadingState,
  SuspenseBoundary,
  SectionSuspense,
  LoadingWrapper,
  withLoading,
  AsyncComponent,
};
