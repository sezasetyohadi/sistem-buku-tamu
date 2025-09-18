import { useState, useCallback } from 'react';

interface UseTurnstileCaptchaProps {
  required?: boolean;
  onVerificationChange?: (isVerified: boolean) => void;
}

interface UseTurnstileCaptchaReturn {
  captchaToken: string | null;
  isCaptchaVerified: boolean;
  captchaError: string | null;
  handleCaptchaVerify: (token: string) => void;
  handleCaptchaError: (error: string) => void;
  handleCaptchaExpire: () => void;
  resetCaptcha: () => void;
  getCaptchaValidationError: () => string | null;
}

export function useTurnstileCaptcha({
  required = true,
  onVerificationChange
}: UseTurnstileCaptchaProps = {}): UseTurnstileCaptchaReturn {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const handleCaptchaVerify = useCallback((token: string) => {
    console.log('CAPTCHA verified with token:', token);
    setCaptchaToken(token);
    setIsCaptchaVerified(true);
    setCaptchaError(null);
    onVerificationChange?.(true);
  }, [onVerificationChange]);

  const handleCaptchaError = useCallback((error: string) => {
    console.error('CAPTCHA error:', error);
    setCaptchaToken(null);
    setIsCaptchaVerified(false);
    setCaptchaError(error);
    onVerificationChange?.(false);
  }, [onVerificationChange]);

  const handleCaptchaExpire = useCallback(() => {
    console.log('CAPTCHA token expired');
    setCaptchaToken(null);
    setIsCaptchaVerified(false);
    setCaptchaError('CAPTCHA expired. Please verify again.');
    onVerificationChange?.(false);
  }, [onVerificationChange]);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setIsCaptchaVerified(false);
    setCaptchaError(null);
    onVerificationChange?.(false);
  }, [onVerificationChange]);

  const getCaptchaValidationError = useCallback((): string | null => {
    if (required && !isCaptchaVerified) {
      return 'Please complete the CAPTCHA verification';
    }
    return null;
  }, [required, isCaptchaVerified]);

  return {
    captchaToken,
    isCaptchaVerified,
    captchaError,
    handleCaptchaVerify,
    handleCaptchaError,
    handleCaptchaExpire,
    resetCaptcha,
    getCaptchaValidationError
  };
}

export default useTurnstileCaptcha;