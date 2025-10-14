'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
  disabled?: boolean;
}

export interface TurnstileCaptchaRef {
  reset: () => void;
  getResponse: () => string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(({
  onVerify,
  onError,
  onExpire,
  theme = 'light',
  size = 'normal',
  className = '',
  disabled = false
}: TurnstileCaptchaProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Load Turnstile script
  useEffect(() => {
    const loadTurnstile = () => {
      if (window.turnstile) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="turnstile"]')) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load Turnstile script');
        onError?.('Gagal memuat CAPTCHA. Silakan periksa koneksi internet Anda.');
      };

      document.head.appendChild(script);
    };

    loadTurnstile();
  }, [onError]);

  // Render widget when Turnstile is loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || isRendered || disabled) {
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not defined');
      onError?.('Kesalahan konfigurasi CAPTCHA');
      return;
    }

    try {
      widgetIdRef.current = window.turnstile!.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme,
        size: size,
        callback: (token: string) => {
          //console.log('Turnstile verification successful:', token);
          onVerify(token);
        },
        'error-callback': (error: string) => {
          console.error('Turnstile error:', error);
          onError?.(error || 'Verifikasi CAPTCHA gagal. Silakan coba lagi.');
        },
        'expired-callback': () => {
          //console.log('Turnstile token expired');
          onExpire?.();
        }
      });

      setIsRendered(true);
      //console.log('Turnstile widget rendered with ID:', widgetIdRef.current);
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
      onError?.('Gagal menginisialisasi CAPTCHA');
    }
  }, [isLoaded, onVerify, onError, onExpire, theme, size, disabled, isRendered]);

  // Reset widget when disabled changes
  useEffect(() => {
    if (widgetIdRef.current && isRendered) {
      if (disabled) {
        // Hide the widget when disabled
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
      } else {
        // Show and reset the widget when enabled
        if (containerRef.current) {
          containerRef.current.style.display = 'block';
        }
        resetWidget();
      }
    }
  }, [disabled, isRendered]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current) {
        try {
          window.turnstile?.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Error removing Turnstile widget:', error);
        }
      }
    };
  }, []);

  // Public methods for external control
  const resetWidget = () => {
    if (widgetIdRef.current && window.turnstile && isRendered) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        //console.log('Turnstile widget reset successfully');
      } catch (error) {
        console.error('Error resetting Turnstile widget:', error);
      }
    }
  };

  const getResponse = () => {
    if (widgetIdRef.current && window.turnstile && isRendered) {
      try {
        return window.turnstile.getResponse(widgetIdRef.current);
      } catch (error) {
        console.error('Error getting Turnstile response:', error);
        return '';
      }
    }
    return '';
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    reset: resetWidget,
    getResponse
  }), [resetWidget, getResponse]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center p-4 bg-gray-100 border border-gray-300 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Memuat verifikasi keamanan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <div 
        ref={containerRef} 
        className="turnstile-widget"
        style={{ display: disabled ? 'none' : 'block' }}
      />
      {disabled && (
        <div className="flex items-center justify-center p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <span className="text-sm text-gray-500">Verifikasi keamanan dinonaktifkan</span>
        </div>
      )}
    </div>
  );
});

TurnstileCaptcha.displayName = 'TurnstileCaptcha';

export default TurnstileCaptcha;

