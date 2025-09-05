/**
 * Loading Components and Utilities
 * Provides consistent loading states and skeleton loaders across the application
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Loading Spinner Component
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className,
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <svg
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Skeleton Loading Component
 */
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height,
}) => {
  const variantClasses = {
    text: 'rounded-sm',
    rectangular: 'rounded-sm',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'bg-gray-200',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
};

/**
 * Loading Overlay Component
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
  spinnerSize?: SpinnerProps['size'];
  backdrop?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  className,
  spinnerSize = 'lg',
  backdrop = true,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center z-50',
          backdrop && 'bg-white/80 backdrop-blur-sm'
        )}>
          <Spinner size={spinnerSize} />
          {text && (
            <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Button Loading State
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const spinnerSizes: Record<typeof size, SpinnerProps['size']> = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Spinner 
          size={spinnerSizes[size]} 
          color={variant === 'outline' || variant === 'ghost' ? 'gray' : 'white'}
          className="mr-2"
        />
      )}
      {isLoading ? (loadingText || children) : children}
    </button>
  );
};

/**
 * Page Loading Component
 */
interface PageLoadingProps {
  text?: string;
  description?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading...',
  description,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="xl" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">{text}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Card Loading Skeleton
 */
interface CardSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  showAction?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  rows = 3,
  showAvatar = false,
  showAction = false,
}) => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <Skeleton variant="circular" width={40} height={40} />
        )}
        <div className="flex-1 space-y-3">
          <Skeleton height={20} width="60%" />
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton 
              key={index} 
              height={16} 
              width={index === rows - 1 ? "40%" : "100%"} 
            />
          ))}
        </div>
        {showAction && (
          <Skeleton width={80} height={32} className="rounded-md" />
        )}
      </div>
    </div>
  );
};

/**
 * Table Loading Skeleton
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
}) => {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        {showHeader && (
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <Skeleton height={16} width="80%" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton 
                    height={16} 
                    width={colIndex === 0 ? "60%" : "80%"} 
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Form Loading Skeleton
 */
interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
  showButton?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  showTitle = true,
  showButton = true,
}) => {
  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <Skeleton height={24} width="40%" className="mb-2" />
          <Skeleton height={16} width="70%" />
        </div>
      )}
      
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton height={16} width="30%" />
            <Skeleton height={40} width="100%" className="rounded-md" />
          </div>
        ))}
      </div>
      
      {showButton && (
        <div className="flex justify-end space-x-3">
          <Skeleton height={40} width={80} className="rounded-md" />
          <Skeleton height={40} width={100} className="rounded-md" />
        </div>
      )}
    </div>
  );
};

/**
 * Statistics Loading Component
 */
export const StatsLoading: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton height={16} width="60%" className="mb-2" />
              <Skeleton height={32} width="40%" />
            </div>
            <Skeleton variant="circular" width={48} height={48} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  Spinner,
  Skeleton,
  LoadingOverlay,
  LoadingButton,
  PageLoading,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  StatsLoading,
};
