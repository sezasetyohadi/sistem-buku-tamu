'use client';

import { useState, useEffect, ReactNode } from 'react';

interface LazyDataLoaderProps<T> {
  loadData: () => Promise<T>;
  renderLoading: () => ReactNode;
  renderData: (data: T) => ReactNode;
  renderError?: (error: Error) => ReactNode;
  dependencies?: any[];
}

function LazyDataLoader<T>({
  loadData,
  renderLoading,
  renderData,
  renderError,
  dependencies = []
}: LazyDataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const result = await loadData();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Use requestIdleCallback if available for non-critical data loading
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        fetchData();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(fetchData, 10);
    }

    return () => {
      isMounted = false;
    };
  }, dependencies);

  if (loading) {
    return renderLoading();
  }

  if (error && renderError) {
    return renderError(error);
  }

  return data ? renderData(data) : null;
}

export default LazyDataLoader;
