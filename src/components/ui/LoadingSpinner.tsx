'use client';

import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Memuat...', 
  className = '' 
}) => {
  // Always use fixed, consistent values to prevent hydration mismatch
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`} suppressHydrationWarning={true}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-600 font-medium">Memuat...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;