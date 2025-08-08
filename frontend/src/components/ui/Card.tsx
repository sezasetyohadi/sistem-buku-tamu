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

export default function Card({ 
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
