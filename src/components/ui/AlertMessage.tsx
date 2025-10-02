import React from 'react';
import { MessageState } from '../../types/admin-profile-types';

interface AlertMessageProps {
  message: MessageState;
  onClose: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ message, onClose }) => {
  if (!message.text) return null;

  return (
    <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
      message.type === 'success' 
        ? 'bg-green-50 text-green-800 border border-green-200' 
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      <div className="flex items-center">
        <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
          {message.type === 'success' ? (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          )}
        </svg>
        <span>{message.text}</span>
      </div>
      <button
        onClick={onClose}
        className={`ml-4 ${message.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'} transition-colors`}
        title="Tutup"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};