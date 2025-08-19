// Komponen Modal yang dapat digunakan ulang
// Filename: Modal.tsx

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const ModalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
};

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = ModalSizes[size];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent dark overlay similar to Instagram modals */}
      <div 
        className="absolute inset-0 z-10"
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'none'
        }}
      >
        {/* This is an empty div but ensures the overlay renders correctly */}
      </div>
      
      {/* Modal container with proper centering - Instagram-style */}
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto z-20">
        {/* Modal content box - clean white background without heavy shadows */}
        <div 
          className={`${sizeClass} w-full bg-white rounded-lg shadow-lg max-h-[90vh] flex flex-col relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with sticky position - Instagram-style */}
          {(title || showCloseButton) && (
            <div className="sticky top-0 flex items-center justify-between py-4 px-5 border-b border-gray-200 bg-white rounded-t-lg z-10">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content area with scrolling - Instagram-style */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
