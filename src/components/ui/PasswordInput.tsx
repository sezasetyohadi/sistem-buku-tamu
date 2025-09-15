'use client';

import { useState } from 'react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  autoComplete?: string;
  showLeftIcon?: boolean;
  focusColor?: 'red' | 'blue';
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'Masukkan password',
  className = '',
  required = false,
  disabled = false,
  label,
  autoComplete = 'current-password',
  showLeftIcon = false,
  focusColor = 'red'
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const leftPadding = showLeftIcon ? 'pl-10' : 'px-4';
  const focusRing = focusColor === 'blue' 
    ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
    : 'focus:ring-2 focus:ring-red-500 focus:border-red-500';
    
  const baseClassName = `w-full ${leftPadding} pr-12 py-3 border border-gray-300 rounded-lg ${focusRing} transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 ${className}`;

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {showLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClassName}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            backgroundColor: '#ffffff !important',
            color: '#1f2937 !important',
            WebkitTextFillColor: '#1f2937 !important',
            WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
            boxShadow: '0 0 0 1000px #ffffff inset !important',
            caretColor: '#1f2937 !important'
          }}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-700 transition-colors duration-200 z-10 hover:bg-gray-100/50 rounded p-1"
          tabIndex={-1}
          title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          disabled={disabled}
        >
          {showPassword ? (
            // Eye slash icon (hide password) - dengan garis diagonal yang tepat melewati tengah mata
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
              <line 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                x1="9" 
                y1="9" 
                x2="15" 
                y2="15"
              />
            </svg>
          ) : (
            // Eye icon (show password)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
