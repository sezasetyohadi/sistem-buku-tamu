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
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {/* Icon di sebelah kiri */}
        <div className={`
          absolute left-3 top-1/2 transform -translate-y-1/2 z-10
          transition-colors duration-200
          ${error 
            ? 'text-red-400' 
            : isFocused 
              ? 'text-blue-500' 
              : 'text-gray-400 hover:text-gray-600'
          }
        `}>
          {getContextualIcon()}
        </div>
        
        <select
          className={`
            w-full pl-12 pr-12 py-3 text-gray-900 bg-white border rounded-xl shadow-sm 
            transition-all duration-200 focus:outline-none focus:ring-2
            ${error 
              ? 'border-red-400 focus:ring-red-100 focus:border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-100'
            }
            hover:shadow-md focus:shadow-lg
            appearance-none cursor-pointer
            bg-gradient-to-r from-white to-gray-50
            hover:from-blue-50 hover:to-white
            focus:from-white focus:to-blue-50
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={!option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Arrow Icon di sebelah kanan - tanpa animasi berlebihan */}
        <div className={`
          absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none
          transition-colors duration-200
          ${error 
            ? 'text-red-400' 
            : isFocused 
              ? 'text-blue-500' 
              : 'text-gray-400'
          }
        `}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Subtle border highlight on focus */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-blue-50 opacity-20 ring-1 ring-blue-200 -z-10" />
        )}
      </div>
      
      {(helperText && !error) && (
        <p className="mt-2 text-sm text-gray-600 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
