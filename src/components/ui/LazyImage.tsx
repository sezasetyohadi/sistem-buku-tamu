'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const LazyImage = ({ src, alt, width, height, className }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersected, setIsIntersected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsIntersected(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' } // Load images when they're within 200px of viewport
      );

      const element = document.querySelector(`[data-image-src="${src}"]`);
      if (element) {
        observer.observe(element);
      }

      return () => {
        observer.disconnect();
        return undefined;
      };
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsIntersected(true);
      return undefined;
    }
  }, [src]);

  return (
    <div 
      className={`relative ${className || ''}`} 
      style={{ width, height }}
      data-image-src={src}
    >
      {isIntersected && (
        <>
          <div 
            className={`absolute inset-0 bg-gray-200 animate-pulse rounded transition-opacity duration-300 ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
            quality={80}
          />
        </>
      )}
      {!isIntersected && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  );
};

export default LazyImage;
