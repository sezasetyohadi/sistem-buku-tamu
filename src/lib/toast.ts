import toast from 'react-hot-toast';

/**
 * Custom toast utility with consistent styling and behavior
 * Replaces all alert() calls with professional notifications
 */
export const showToast = {
  /**
   * Show success message
   */
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#10B981',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 'medium' as any,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    });
  },

  /**
   * Show error message
   */
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 'medium' as any,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      },
    });
  },

  /**
   * Show warning message
   */
  warning: (message: string) => {
    toast(message, {
      duration: 4500,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 'medium' as any,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
      },
    });
  },

  /**
   * Show info message
   */
  info: (message: string) => {
    toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 'medium' as any,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
    });
  },

  /**
   * Show loading message with promise handling
   */
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#6B7280',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 'medium' as any,
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  },

  /**
   * Dismiss specific toast
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Session timeout specific toast with longer duration and special styling
   */
  sessionTimeout: (message: string) => {
    toast.error(message, {
      duration: 8000,
      style: {
        background: '#DC2626',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 'semibold' as any,
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)',
        border: '2px solid #FCA5A5',
      },
      icon: '🔒',
    });
  },

  /**
   * Form validation error with shorter duration
   */
  validation: (message: string) => {
    toast.error(message, {
      duration: 3000,
      style: {
        background: '#F87171',
        color: '#FFFFFF',
        fontSize: '13px',
        fontWeight: 'medium' as any,
        borderRadius: '6px',
        padding: '10px 14px',
        boxShadow: '0 2px 8px rgba(248, 113, 113, 0.3)',
      },
      icon: '❌',
    });
  },
};
