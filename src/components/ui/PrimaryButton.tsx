// Komponen Button yang dapat digunakan ulang
// Filename: PrimaryButton.tsx

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const ButtonVariants = {
  primary: {
    background: 'linear-gradient(135deg, #3D5DC3, #2563EB)',
    color: '#FFFFFF',
    shadow: '0 25px 50px -12px rgba(61, 93, 195, 0.25)'
  },
  secondary: {
    background: 'linear-gradient(135deg, #F29442, #EA580C)',
    color: '#FFFFFF', 
    shadow: '0 25px 50px -12px rgba(242, 148, 66, 0.25)'
  },
  success: {
    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
    color: '#FFFFFF',
    shadow: '0 25px 50px -12px rgba(34, 197, 94, 0.25)'
  },
  warning: {
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    color: '#FFFFFF',
    shadow: '0 25px 50px -12px rgba(245, 158, 11, 0.25)'
  },
  danger: {
    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
    color: '#FFFFFF',
    shadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
  }
};

const ButtonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export default function PrimaryButton({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  icon,
  children, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const variantStyle = ButtonVariants[variant];
  const sizeClass = ButtonSizes[size];
  
  return (
    <button
      className={`font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${sizeClass} ${className}`}
      style={{
        background: variantStyle.background,
        color: variantStyle.color,
        boxShadow: variantStyle.shadow
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="flex items-center justify-center">
        {isLoading ? (
          <span className="animate-spin mr-2">⏳</span>
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
        {!isLoading && !icon && (
          <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
        )}
      </span>
    </button>
  );
}
