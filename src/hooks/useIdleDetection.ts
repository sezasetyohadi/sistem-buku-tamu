'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';

import { showToast } from '@/lib/toast';

interface UseIdleDetectionProps {
  timeout: number; // timeout in milliseconds
  onIdle: () => void;
  enabled?: boolean;
}

export function useIdleDetection({ timeout, onIdle, enabled = true }: UseIdleDetectionProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Update the callback ref when onIdle changes
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (!enabled) {return;}

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeout);
  }, [timeout, enabled]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // List of events to track for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
      'focus',
      'blur'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, handleActivity, resetTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}

// Hook specifically for admin idle logout - no warning, just logout after 20 minutes
export function useAdminIdleLogout(enabled: boolean = true) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    //console.log('Admin idle timeout - logging out after 20 minutes');
    
    try {
      // Call logout API to clear JWT cookies
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during idle logout API call:', error);
    }
    
    // Show session timeout notification to user
    showToast.sessionTimeout('Sesi Anda telah berakhir karena tidak ada aktivitas selama 20 menit. Silakan login kembali.');
    
    // Redirect to login
    router.push('/admin/login');
  }, [router]);

  // 20 minutes = 20 * 60 * 1000 = 1,200,000 milliseconds
  useIdleDetection({
    timeout: 20 * 60 * 1000, // 20 minutes - production setting
    onIdle: handleLogout,
    enabled
  });
}
