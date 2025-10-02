import React, { useEffect } from 'react';
import { LoadingButton } from './loading-states';

interface DeleteConfirmDialogProps {
  // Props dari DeleteConfirmationDialog (detailed variant)
  isOpen?: boolean;
  title: string;
  message: string;
  itemName?: string;
  onClose?: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  
  // Props dari DeleteConfirmModal (simple variant) 
  show?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  
  // New props untuk customization
  variant?: 'simple' | 'detailed';
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  // Support both prop naming conventions
  isOpen = false,
  show = false,
  title,
  message,
  itemName,
  onClose,
  onCancel,
  onConfirm,
  isLoading = false,
  loading = false,
  variant = 'detailed',
  confirmText = 'Ya, Hapus Data',
  cancelText = 'Batal'
}) => {
  // Normalize props (support both naming conventions)
  const isVisible = isOpen || show;
  const isProcessing = isLoading || loading;
  const handleCancel = onClose || onCancel || (() => {});

  // Prevent body scrolling when dialog is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const handleOverlayClick = () => {
    if (!isProcessing) {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 z-10"
        onClick={handleOverlayClick}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'none'
        }}
      />
      
      {/* Dialog container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto z-20">
        <div 
          className="max-w-md w-full bg-white rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {variant === 'detailed' ? (
            // Detailed variant (dari DeleteConfirmationDialog)
            <>
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
                {itemName && (
                  <p className="font-semibold text-gray-900">"{itemName}"</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 flex justify-end gap-3 border-t border-gray-100">
                <LoadingButton
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isProcessing}
                >
                  {cancelText}
                </LoadingButton>
                <LoadingButton
                  onClick={onConfirm}
                  isLoading={isProcessing}
                  variant="danger"
                >
                  {confirmText}
                </LoadingButton>
              </div>
            </>
          ) : (
            // Simple variant (dari DeleteConfirmModal)
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-gray-600">{message}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <LoadingButton
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isProcessing}
                >
                  {cancelText}
                </LoadingButton>
                <LoadingButton
                  onClick={onConfirm}
                  isLoading={isProcessing}
                  variant="danger"
                >
                  {confirmText}
                </LoadingButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export dengan berbagai nama untuk backward compatibility
export default DeleteConfirmDialog;
export { DeleteConfirmDialog as DeleteConfirmationDialog };
export { DeleteConfirmDialog as DeleteConfirmModal };