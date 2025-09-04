'use client';

import { useEffect, useState, useCallback, RefObject } from 'react';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

export function useLazyLoading<T extends HTMLElement>(
  options: UseLazyLoadingOptions = {}
): [boolean, RefObject<T>] {
  const [ref, setRef] = useState<T | null>(null);
  const [inView, setInView] = useState(false);

  const { rootMargin = '200px', threshold = 0 } = options;

  const setReferenceElement = useCallback((node: T | null) => {
    setRef(node);
  }, []);

  useEffect(() => {
    if (!ref) return;
    
    let observer: IntersectionObserver;
    
    // Use IntersectionObserver if available
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          // Update state when element enters viewport
          setInView(entry.isIntersecting);
        },
        { rootMargin, threshold }
      );
      
      observer.observe(ref);
    } else {
      // Fallback for browsers without IntersectionObserver
      setInView(true);
    }
    
    return () => {
      if (observer && ref) {
        observer.unobserve(ref);
        observer.disconnect();
      }
    };
  }, [ref, rootMargin, threshold]);
  
  return [inView, { current: ref } as RefObject<T>];
}

export default useLazyLoading;
