/**
 * Cloudflare Turnstile server-side verification utility
 */

interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

interface VerifyCaptchaOptions {
  token: string;
  remoteip?: string;
}

interface VerifyCaptchaResult {
  success: boolean;
  error?: string;
  data?: TurnstileVerificationResponse;
}

/**
 * Verify Turnstile CAPTCHA token with Cloudflare
 */
export async function verifyCaptchaToken({
  token,
  remoteip
}: VerifyCaptchaOptions): Promise<VerifyCaptchaResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return {
      success: false,
      error: 'CAPTCHA verification not configured'
    };
  }

  if (!token) {
    return {
      success: false,
      error: 'CAPTCHA token is required'
    };
  }

  try {
    // Prepare form data for Cloudflare API
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    // Call Cloudflare Turnstile verify endpoint
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TurnstileVerificationResponse = await response.json();

    if (result.success) {
      console.log('CAPTCHA verification successful');
      return {
        success: true,
        data: result
      };
    } else {
      const errorCodes = result['error-codes'] || [];
      console.warn('CAPTCHA verification failed:', errorCodes);
      
      // Map error codes to user-friendly messages
      let errorMessage = 'CAPTCHA verification failed';
      
      if (errorCodes.includes('timeout-or-duplicate')) {
        errorMessage = 'CAPTCHA token has expired or already been used';
      } else if (errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Invalid CAPTCHA token';
      } else if (errorCodes.includes('missing-input-response')) {
        errorMessage = 'CAPTCHA token is missing';
      } else if (errorCodes.includes('internal-error')) {
        errorMessage = 'CAPTCHA verification service error';
      }
      
      return {
        success: false,
        error: errorMessage,
        data: result
      };
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    return {
      success: false,
      error: 'Failed to verify CAPTCHA. Please try again.'
    };
  }
}

/**
 * Middleware function to verify CAPTCHA in API routes
 */
export function createCaptchaMiddleware(options?: {
  required?: boolean;
  skipInDevelopment?: boolean;
}) {
  const { required = true, skipInDevelopment = false } = options || {};
  
  return async function verifyCaptcha(req: any): Promise<VerifyCaptchaResult> {
    // Skip verification in development if configured
    if (skipInDevelopment && process.env.NODE_ENV === 'development') {
      console.log('Skipping CAPTCHA verification in development mode');
      return { success: true };
    }
    
    const captchaToken = req.body?.captchaToken;
    
    if (!required && !captchaToken) {
      return { success: true };
    }
    
    if (required && !captchaToken) {
      return {
        success: false,
        error: 'CAPTCHA verification is required'
      };
    }
    
    // Get client IP for additional verification
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection?.remoteAddress;
    
    return await verifyCaptchaToken({
      token: captchaToken,
      remoteip: ip
    });
  };
}

export default verifyCaptchaToken;