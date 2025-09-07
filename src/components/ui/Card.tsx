// Komponen Card yang dapat digunakan ulang
// Filename: Card.tsx

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const CardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-lg border-0',
  bordered: 'bg-white border-2 border-gray-300 shadow-none',
  gradient: 'bg-gradient-to-br from-[#3D5DC3]/5 to-[#F29442]/5 border border-[#3D5DC3]/20 shadow-sm'
};

const CardPadding = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
};

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  hover = false
}: CardProps) {
  const variantClass = CardVariants[variant];
  const paddingClass = CardPadding[padding];
  
  return (
    <div 
      className={`
        rounded-xl transition-all duration-300
        ${variantClass}
        ${paddingClass}
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Additional card components for dashboard layout
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

// Default export for backward compatibility
export default Card;
