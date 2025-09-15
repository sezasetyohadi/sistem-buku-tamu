import React, { useEffect } from 'react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationDialog({
  isOpen,
  title,
  message,
  itemName,
  onClose,
  onConfirm,
  isLoading = false
}: DeleteConfirmationDialogProps) {
  // Prevent body scrolling when dialog is open
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

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent dark overlay similar to other modals */}
      <div 
        className="absolute inset-0 z-10"
        onClick={!isLoading ? onClose : undefined}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'none'
        }}
      >
        {/* This is an empty div but ensures the overlay renders correctly */}
      </div>
      
      {/* Dialog container with proper centering */}
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto z-20">
        <div 
          className="max-w-md w-full bg-white rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-900">{title}</h3>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-gray-700 mb-3">{message}</p>
            <p className="font-semibold text-gray-900">"{itemName}"</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 flex justify-end gap-3 border-t border-gray-100">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2 text-white rounded-md transition-colors ${
                isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menghapus...
                </span>
              ) : 'Ya, Hapus Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
