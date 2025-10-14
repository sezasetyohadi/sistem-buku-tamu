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
      error: 'Verifikasi CAPTCHA tidak dikonfigurasi'
    };
  }

  if (!token) {
    return {
      success: false,
      error: 'Token CAPTCHA diperlukan'
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
      //console.log('CAPTCHA verification successful');
      return {
        success: true,
        data: result
      };
    } else {
      const errorCodes = result['error-codes'] || [];
      console.warn('CAPTCHA verification failed:', errorCodes);
      
      // Map error codes to user-friendly messages
      let errorMessage = 'Verifikasi CAPTCHA gagal';
      
      if (errorCodes.includes('timeout-or-duplicate')) {
        errorMessage = 'Token CAPTCHA telah kedaluwarsa atau sudah digunakan';
      } else if (errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Token CAPTCHA tidak valid';
      } else if (errorCodes.includes('missing-input-response')) {
        errorMessage = 'Token CAPTCHA tidak ada';
      } else if (errorCodes.includes('internal-error')) {
        errorMessage = 'Kesalahan layanan verifikasi CAPTCHA';
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
      error: 'Gagal memverifikasi CAPTCHA. Silakan coba lagi.'
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
      //console.log('Skipping CAPTCHA verification in development mode');
      return { success: true };
    }
    
    // Handle both NextRequest and parsed body objects
    let captchaToken: string | undefined;
    let headers: any = {};
    
    if (req.body && typeof req.body === 'object') {
      // Case where parsed body is passed directly
      captchaToken = req.body.captchaToken;
      headers = req.headers || {};
    } else if (req.json && typeof req.json === 'function') {
      // Case where NextRequest is passed
      try {
        const body = await req.json();
        captchaToken = body.captchaToken;
        headers = req.headers;
      } catch (error) {
        console.error('Error parsing request body for CAPTCHA:', error);
        return {
          success: false,
          error: 'Gagal mem-parsing request body'
        };
      }
    } else {
      // Fallback - try to access captchaToken directly
      captchaToken = req.captchaToken;
      headers = req.headers || {};
    }
    
    if (!required && !captchaToken) {
      return { success: true };
    }
    
    if (required && !captchaToken) {
      return {
        success: false,
        error: 'Verifikasi CAPTCHA diperlukan'
      };
    }
    
    // Get client IP for additional verification
    const forwarded = headers['x-forwarded-for'] || headers.get?.('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.connection?.remoteAddress || req.ip;
    
    return await verifyCaptchaToken({
      token: captchaToken!,
      remoteip: ip
    });
  };
}

export default verifyCaptchaToken;