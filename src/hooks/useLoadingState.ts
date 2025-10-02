/**
 * Custom Loading State Hook
 * Simple loading state management hook as replacement for removed LoadingState
 */

import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export function useLoadingState(key?: string): LoadingState {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    setLoading,
    startLoading,
    stopLoading
  };
}