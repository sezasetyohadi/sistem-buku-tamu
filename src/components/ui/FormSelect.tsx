// Komponen Select yang dapat digunakan ulang
// Filename: FormSelect.tsx

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'error';
  options: { value: string; label: string }[];
}

const SelectVariants = {
  default: {
    border: 'border-gray-300 focus:border-[#3D5DC3]',
    ring: 'focus:ring-[#3D5DC3]'
  },
  success: {
    border: 'border-green-500 focus:border-green-600',
    ring: 'focus:ring-green-500'
  },
  error: {
    border: 'border-red-500 focus:border-red-600',
    ring: 'focus:ring-red-500'
  }
};

export default function FormSelect({ 
  label, 
  helperText, 
  error, 
  icon, 
  variant = 'default',
  options,
  className = '', 
  ...props 
}: SelectProps) {
  const selectVariant = error ? SelectVariants.error : variant === 'success' ? SelectVariants.success : SelectVariants.default;
  
  return (
    <div className="w-full">
      {label && (
  <label className="block text-sm font-semibold text-black mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-700">
            {icon}
          </div>
        )}
        
        <select
          className={`
            w-full px-4 py-3 text-black 
            border rounded-lg shadow-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            appearance-none cursor-pointer
            ${selectVariant.border} ${selectVariant.ring}
            ${icon ? 'pl-10' : ''}
            ${error ? 'bg-red-50' : 'bg-white hover:bg-gray-50 focus:bg-white'}
            ${className}
          `}
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
