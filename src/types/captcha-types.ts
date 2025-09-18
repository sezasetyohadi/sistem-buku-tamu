// Additional types for CAPTCHA integration

export interface CaptchaVerificationRequest {
  captchaToken: string;
  remoteip?: string;
}

export interface CaptchaVerificationResponse {
  success: boolean;
  error?: string;
  data?: {
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
  };
}

// Extend existing form interfaces with CAPTCHA token
export interface GuestRegistrationWithCaptcha {
  captchaToken?: string;
  [key: string]: any;
}

export interface SurveySubmissionWithCaptcha {
  captchaToken?: string;
  identity: any;
  answers: any[];
  feedback?: string;
}

// CAPTCHA configuration
export interface CaptchaConfig {
  siteKey: string;
  secretKey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  enabled?: boolean;
}