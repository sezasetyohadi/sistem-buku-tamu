// Komponen Select yang dapat digunakan ulang dengan icon
// Filename: FormSelect.tsx

"use client";

import React, { useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  required?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

export default function FormSelect({ 
  label, 
  error, 
  options, 
  required = false,
  helperText,
  icon,
  className = "",
  ...props 
}: FormSelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Get appropriate icon based on the label
  const getContextualIcon = () => {
    if (icon) return icon;
    
    // Return generic list icon for all dropdowns - no more contextual icons
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="w-full">
      {label && (
  <label className="block text-sm font-semibold text-black mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Icon di sebelah kiri */}
        <div className={`
          absolute left-4 top-1/2 transform -translate-y-1/2 z-10
          transition-colors duration-200 pointer-events-none
          ${error 
            ? 'text-red-400' 
            : isFocused 
              ? 'text-blue-500' 
              : 'text-gray-400'
          }
        `}>
          {getContextualIcon()}
        </div>
        
        <select
          className={`
            w-full pl-12 pr-12 py-3 text-black 
            border border-gray-300 rounded-lg shadow-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500
            appearance-none cursor-pointer
            bg-white hover:bg-gray-50 focus:bg-white
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          style={{
            paddingLeft: '3rem',    /* 48px - space for icon */
            paddingRight: '3rem',   /* 48px - space for dropdown arrow */
            color: '#000000',
            backgroundColor: '#ffffff',
            /* Dark mode fixes */
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} 
              style={{ 
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: '8px 12px'
              }}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <svg className={`w-5 h-5 transition-colors duration-200 ${
            error ? 'text-red-400' : isFocused ? 'text-blue-500' : 'text-gray-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Subtle border highlight on focus */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-lg pointer-events-none ring-2 ring-blue-200 ring-opacity-50 -z-10" />
        )}
      </div>
      
      {(helperText || error) && (
        <div className="mt-2">
          {error ? (
            <p className="text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          ) : helperText ? (
            <p className="text-sm text-black">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
