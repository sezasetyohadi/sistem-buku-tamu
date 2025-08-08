// Komponen Input yang dapat digunakan ulang
// Filename: FormInput.tsx

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'error';
}

const InputVariants = {
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

export default function FormInput({ 
  label, 
  helperText, 
  error, 
  icon, 
  variant = 'default',
  className = '', 
  ...props 
}: InputProps) {
  const inputVariant = error ? InputVariants.error : variant === 'success' ? InputVariants.success : InputVariants.default;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
        
        <input
          className={`
            w-full px-4 py-3 text-gray-900 placeholder-gray-500 
            border rounded-lg shadow-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${inputVariant.border} ${inputVariant.ring}
            ${icon ? 'pl-10' : ''}
            ${error ? 'bg-red-50' : 'bg-white hover:bg-gray-50 focus:bg-white'}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {(helperText || error) && (
        <div className="mt-2">
          {error ? (
            <p className="text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          ) : helperText ? (
            <p className="text-sm text-gray-800">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
