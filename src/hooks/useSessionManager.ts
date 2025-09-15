/**
 * Session Management Hook
 * Handles automatic token refresh, idle detection, and session timeout
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { authLogger } from '@/lib/logger';
import { showToast } from '@/lib/toast';

interface UseSessionManagerOptions {
  idleTimeout?: number; // in milliseconds, default 20 minutes
  refreshBeforeExpiry?: number; // refresh token X minutes before expiry, default 5 minutes
  warningTime?: number; // warn user X minutes before timeout, default 2 minutes
  enabled?: boolean;
}

export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const {
    idleTimeout = 20 * 60 * 1000, // 20 minutes
    refreshBeforeExpiry = 5 * 60 * 1000, // 5 minutes
    warningTime = 2 * 60 * 1000, // 2 minutes
    enabled = true,
  } = options;

  const { isAuthenticated, lastActivity, logout, refreshToken, updateActivity } = useAuth();
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    warningShownRef.current = false;
  }, []);

  // Handle session timeout
  const handleSessionTimeout = useCallback(async () => {
    authLogger.info('Session timeout - logging out due to inactivity');
    showToast.sessionTimeout('Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.');
    await logout();
  }, [logout]);

  // Show warning before timeout
  const showTimeoutWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      const warningMinutes = Math.floor(warningTime / 60000);
      showToast.warning(`Sesi Anda akan berakhir dalam ${warningMinutes} menit karena tidak ada aktivitas.`);
    }
  }, [warningTime]);

  // Start idle detection
  const startIdleDetection = useCallback(() => {
    if (!enabled || !isAuthenticated) {return;}

    clearTimers();

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    const timeUntilTimeout = idleTimeout - timeSinceLastActivity;
    const timeUntilWarning = timeUntilTimeout - warningTime;

    // If already past timeout, logout immediately
    if (timeUntilTimeout <= 0) {
      handleSessionTimeout();
      return;
    }

    // Set warning timer
    if (timeUntilWarning > 0) {
      warningTimerRef.current = setTimeout(() => {
        showTimeoutWarning();
      }, timeUntilWarning);
    } else {
      // Show warning immediately if we're in the warning period
      showTimeoutWarning();
    }

    // Set timeout timer
    idleTimerRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, timeUntilTimeout);

    authLogger.debug(`Idle detection started - timeout in ${Math.floor(timeUntilTimeout / 1000)}s`);
  }, [enabled, isAuthenticated, lastActivity, idleTimeout, warningTime, handleSessionTimeout, showTimeoutWarning, clearTimers]);

  // Handle token refresh
  const handleTokenRefresh = useCallback(async () => {
    if (!enabled || !isAuthenticated) {return;}

    try {
      authLogger.debug('Attempting automatic token refresh');
      const success = await refreshToken();
      
      if (success) {
        authLogger.debug('Token refresh successful');
        // Schedule next refresh
        refreshTimerRef.current = setTimeout(handleTokenRefresh, refreshBeforeExpiry);
      } else {
        authLogger.warn('Token refresh failed - user may need to re-authenticate');
        showToast.warning('Sesi Anda akan segera berakhir. Silakan simpan pekerjaan Anda.');
      }
    } catch (error) {
      authLogger.error('Token refresh error:', error);
    }
  }, [enabled, isAuthenticated, refreshToken, refreshBeforeExpiry]);

  // Reset timers when activity occurs
  const resetTimers = useCallback(() => {
    if (!enabled || !isAuthenticated) {return;}

    clearTimers();
    warningShownRef.current = false;
    updateActivity();
    
    // Restart idle detection
    setTimeout(startIdleDetection, 100);
  }, [enabled, isAuthenticated, clearTimers, updateActivity, startIdleDetection]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!enabled || !isAuthenticated) {return;}

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
    ];

    const throttledResetTimers = throttle(resetTimers, 1000); // Throttle to once per second

    events.forEach(event => {
      document.addEventListener(event, throttledResetTimers, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledResetTimers, true);
      });
    };
  }, [enabled, isAuthenticated, resetTimers]);

  // Start session management when authenticated
  useEffect(() => {
    if (enabled && isAuthenticated) {
      startIdleDetection();
      
      // Schedule initial token refresh
      refreshTimerRef.current = setTimeout(handleTokenRefresh, refreshBeforeExpiry);
    } else {
      clearTimers();
    }

    return () => {
      clearTimers();
    };
  }, [enabled, isAuthenticated, startIdleDetection, handleTokenRefresh, refreshBeforeExpiry, clearTimers]);

  return {
    resetSession: resetTimers,
    forceRefresh: handleTokenRefresh,
  };
}

// Utility function to throttle events
function throttle<T extends(...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return ((...args: any[]) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  }) as T;
}
