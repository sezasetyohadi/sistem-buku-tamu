/**
 * Environment Variable Validation System
 * Ensures all required environment variables are properly configured for production
 */

interface EnvironmentConfig {
  // Database Configuration
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: number;
  
  // Security Configuration
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production' | 'test';
  HTTPS_ENFORCED?: boolean;
  
  // Optional Configuration
  TOKEN_CLEANUP_KEY?: string;
  EMAIL_SMTP_HOST?: string;
  EMAIL_SMTP_PORT?: number;
  EMAIL_SMTP_USER?: string;
  EMAIL_SMTP_PASS?: string;
}

interface ValidationRule {
  required: boolean;
  minLength?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

const ENV_VALIDATION_RULES: Record<keyof EnvironmentConfig, ValidationRule> = {
  DB_HOST: {
    required: true,
    minLength: 1,
    errorMessage: 'Database host is required'
  },
  DB_USER: {
    required: true,
    minLength: 1,
    errorMessage: 'Database user is required'
  },
  DB_PASSWORD: {
    required: false, // Allow empty for local development
    errorMessage: 'Database password should be set for production'
  },
  DB_NAME: {
    required: true,
    minLength: 1,
    errorMessage: 'Database name is required'
  },
  DB_PORT: {
    required: true,
    validator: (value) => {
      const port = Number(value);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    errorMessage: 'Database port must be a valid port number (1-65535)'
  },
  JWT_SECRET: {
    required: true,
    minLength: 32,
    validator: (value) => {
      // Ensure it's not the default development secret
      return value !== 'my-super-secret-jwt-key-for-development-change-in-production';
    },
    errorMessage: 'JWT_SECRET must be at least 32 characters and not the default development value'
  },
  NODE_ENV: {
    required: true,
    validator: (value) => ['development', 'production', 'test'].includes(value),
    errorMessage: 'NODE_ENV must be development, production, or test'
  },
  HTTPS_ENFORCED: {
    required: false,
    validator: (value) => value === undefined || ['true', 'false'].includes(value?.toLowerCase()),
    errorMessage: 'HTTPS_ENFORCED must be true or false'
  },
  TOKEN_CLEANUP_KEY: {
    required: false,
    minLength: 16,
    errorMessage: 'TOKEN_CLEANUP_KEY should be at least 16 characters if provided'
  },
  EMAIL_SMTP_HOST: {
    required: false,
    errorMessage: 'EMAIL_SMTP_HOST should be a valid hostname'
  },
  EMAIL_SMTP_PORT: {
    required: false,
    validator: (value) => {
      if (value === undefined) return true;
      const port = Number(value);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    errorMessage: 'EMAIL_SMTP_PORT must be a valid port number'
  },
  EMAIL_SMTP_USER: {
    required: false,
    errorMessage: 'EMAIL_SMTP_USER should be provided if email is configured'
  },
  EMAIL_SMTP_PASS: {
    required: false,
    errorMessage: 'EMAIL_SMTP_PASS should be provided if email is configured'
  }
};

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private validatedConfig: EnvironmentConfig | null = null;

  private constructor() {}

  static getInstance(): EnvironmentValidator {
    if (!this.instance) {
      this.instance = new EnvironmentValidator();
    }
    return this.instance;
  }

  /**
   * Validate all environment variables and return validated configuration
   */
  validateEnvironment(): EnvironmentConfig {
    if (this.validatedConfig) {
      return this.validatedConfig;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Partial<EnvironmentConfig> = {};

    // Validate each environment variable
    for (const [key, rule] of Object.entries(ENV_VALIDATION_RULES)) {
      const value = process.env[key];
      const validation = this.validateVariable(key, value, rule);

      if (validation.isValid) {
        (config as any)[key] = validation.value;
      } else {
        if (rule.required) {
          errors.push(validation.error!);
        } else {
          warnings.push(validation.error!);
        }
      }
    }

    // Production-specific validations
    if (config.NODE_ENV === 'production') {
      this.validateProductionRequirements(config, errors, warnings);
    }

    // Log warnings
    if (warnings.length > 0) {
      console.warn('⚠️  Environment Configuration Warnings:');
      warnings.forEach(warning => console.warn(`   - ${warning}`));
    }

    // Fail if there are errors
    if (errors.length > 0) {
      console.error('❌ Environment Configuration Errors:');
      errors.forEach(error => console.error(`   - ${error}`));
      throw new Error(`Environment validation failed. ${errors.length} error(s) found.`);
    }

    this.validatedConfig = config as EnvironmentConfig;
    console.log('✅ Environment validation successful');
    
    return this.validatedConfig;
  }

  /**
   * Validate a single environment variable
   */
  private validateVariable(
    key: string, 
    value: string | undefined, 
    rule: ValidationRule
  ): { isValid: boolean; value?: any; error?: string } {
    // Check if required
    if (rule.required && (value === undefined || value === '')) {
      return {
        isValid: false,
        error: rule.errorMessage || `${key} is required`
      };
    }

    // Skip validation if not provided and not required
    if (!value && !rule.required) {
      return { isValid: true };
    }

    // Convert value if needed
    let processedValue: any = value;
    if (key === 'DB_PORT' || key === 'EMAIL_SMTP_PORT') {
      processedValue = Number(value);
    }
    if (key === 'HTTPS_ENFORCED') {
      processedValue = value?.toLowerCase() === 'true';
    }

    // Check minimum length
    if (rule.minLength && value && value.length < rule.minLength) {
      return {
        isValid: false,
        error: rule.errorMessage || `${key} must be at least ${rule.minLength} characters`
      };
    }

    // Check pattern
    if (rule.pattern && value && !rule.pattern.test(value)) {
      return {
        isValid: false,
        error: rule.errorMessage || `${key} format is invalid`
      };
    }

    // Check custom validator
    if (rule.validator && !rule.validator(processedValue)) {
      return {
        isValid: false,
        error: rule.errorMessage || `${key} validation failed`
      };
    }

    return {
      isValid: true,
      value: processedValue
    };
  }

  /**
   * Additional validations for production environment
   */
  private validateProductionRequirements(
    config: Partial<EnvironmentConfig>, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Database password should be set in production
    if (!config.DB_PASSWORD) {
      warnings.push('Database password is empty in production environment');
    }

    // JWT secret strength check for production
    if (config.JWT_SECRET && config.JWT_SECRET.length < 64) {
      warnings.push('JWT_SECRET should be at least 64 characters for production');
    }

    // HTTPS should be enforced in production
    if (!config.HTTPS_ENFORCED) {
      warnings.push('HTTPS enforcement is recommended for production');
    }

    // Email configuration check
    const hasEmailConfig = config.EMAIL_SMTP_HOST || config.EMAIL_SMTP_USER;
    if (hasEmailConfig) {
      if (!config.EMAIL_SMTP_HOST) {
        errors.push('EMAIL_SMTP_HOST is required when email is configured');
      }
      if (!config.EMAIL_SMTP_USER) {
        errors.push('EMAIL_SMTP_USER is required when email is configured');
      }
      if (!config.EMAIL_SMTP_PASS) {
        warnings.push('EMAIL_SMTP_PASS is recommended when email is configured');
      }
    }
  }

  /**
   * Get validated configuration (must call validateEnvironment first)
   */
  getConfig(): EnvironmentConfig {
    if (!this.validatedConfig) {
      throw new Error('Environment not validated. Call validateEnvironment() first.');
    }
    return this.validatedConfig;
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getConfig().NODE_ENV === 'production';
  }

  /**
   * Check if HTTPS is enforced
   */
  isHttpsEnforced(): boolean {
    return this.getConfig().HTTPS_ENFORCED === true;
  }
}

// Singleton instance
export const envValidator = EnvironmentValidator.getInstance();

// Auto-validate on import in production or when explicitly requested
// Note: process.exit() cannot be used in Edge Runtime (middleware)
if (typeof process !== 'undefined' && process.env) {
  const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge' || 
                       typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis;
  
  if (process.env.NODE_ENV === 'production') {
    try {
      envValidator.validateEnvironment();
      console.log('🔒 Production environment validated successfully');
    } catch (error) {
      console.error('🚨 Critical: Environment validation failed during startup');
      console.error('   Application cannot start safely with current configuration');
      console.error('   Error:', error);
      
      // Only exit in Node.js runtime, not Edge Runtime
      if (!isEdgeRuntime && typeof process.exit === 'function') {
        process.exit(1);
      } else {
        throw new Error('Environment validation failed - cannot start application');
      }
    }
  } else if (process.env.VALIDATE_ENV === 'true') {
    try {
      envValidator.validateEnvironment();
      console.log('✅ Development environment validation passed');
    } catch (error) {
      console.warn('⚠️  Environment validation failed:', error);
      console.warn('   Continuing in development mode...');
    }
  }
}

export default envValidator;
