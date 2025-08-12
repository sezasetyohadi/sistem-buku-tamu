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
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
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
            w-full px-4 py-3 text-black 
            border rounded-lg shadow-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-opacity-50
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
            <option key={option.value} value={option.value} className="text-black">
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Subtle border highlight on focus */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-blue-50 opacity-20 ring-1 ring-blue-200 -z-10" />
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
