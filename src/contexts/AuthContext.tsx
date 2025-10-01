/**
 * Authentication Context & Hook
 * Provides centralized authentication state management with proper token handling
 */

'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';

import { authLogger, safeLog } from '@/lib/logger';
import { showToast } from '@/lib/toast';

// Types
interface AdminUser {
  userId: number;
  username: string;
  email: string;
  nama_lengkap: string;
  bidang_tujuan_id: number;
  profile_picture?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  error: string | null;
  lastActivity: number;
}

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AdminUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'UPDATE_USER'; payload: Partial<AdminUser> }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  lastActivity: Date.now(),
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
        lastActivity: Date.now(),
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: Date.now(),
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateActivity: () => void;
  updateUser: (userData: Partial<AdminUser>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch('/api/admin/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.admin) {
          dispatch({ type: 'AUTH_SUCCESS', payload: result.admin });
          safeLog.audit('Authentication check successful', result.admin.username);
        } else {
          throw new Error(result.message || 'Authentication failed');
        }
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          throw new Error('Session expired');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication check failed';
      authLogger.debug('Authentication check failed:', errorMessage);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.admin) {
          dispatch({ type: 'AUTH_SUCCESS', payload: result.admin });
          authLogger.debug('Token refreshed successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      authLogger.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.admin) {
          dispatch({ type: 'AUTH_SUCCESS', payload: result.admin });
          safeLog.audit('User login successful', result.admin.username);
          showToast.success(`Selamat datang, ${result.admin.nama_lengkap}!`);
          return true;
        } else {
          throw new Error(result.message || 'Login failed');
        }
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      showToast.error(errorMessage);
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        authLogger.debug('Logout API call successful');
      } else {
        authLogger.warn('Logout API call failed, proceeding with client-side logout');
      }
    } catch (error) {
      authLogger.error('Logout API error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
      safeLog.audit('User logout');
      router.push('/admin/login');
      showToast.success('Anda telah berhasil logout');
    }
  }, [router]);

  // Update activity
  const updateActivity = useCallback(() => {
    dispatch({ type: 'UPDATE_ACTIVITY' });
  }, []);

  // Update user data
  const updateUser = useCallback((userData: Partial<AdminUser>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      updateActivity();
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuth,
    refreshToken,
    updateActivity,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}
