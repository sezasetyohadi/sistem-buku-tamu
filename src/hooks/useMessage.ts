import { useState, useEffect } from 'react';
import { MessageState } from '../types/admin-profile-types';
import { MESSAGE_AUTO_HIDE_DELAY } from '../constants/admin-profile';

export const useMessage = () => {
  const [message, setMessage] = useState<MessageState>({ type: '', text: '' });

  // Auto-hide message after delay
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, MESSAGE_AUTO_HIDE_DELAY);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message.text]);

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  const setSuccessMessage = (text: string) => {
    setMessage({ type: 'success', text });
  };

  const setErrorMessage = (text: string) => {
    setMessage({ type: 'error', text });
  };

  return {
    message,
    setMessage,
    clearMessage,
    setSuccessMessage,
    setErrorMessage
  };
};