/**
 * Production-safe logging utility
 * Conditionally logs based on environment and log level
 * Replaces direct console.* calls throughout the codebase
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerOptions {
  prefix?: string;
  includeTimestamp?: boolean;
  enableInProduction?: boolean;
}

class Logger {
  private options: LoggerOptions;
  private isDevelopment: boolean;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      prefix: '',
      includeTimestamp: true,
      enableInProduction: false,
      ...options,
    };
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors, even in production
    if (level === 'error') {return true;}
    
    // In production, only log if explicitly enabled
    if (!this.isDevelopment && !this.options.enableInProduction) {
      return false;
    }
    
    return true;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): [string, ...any[]] {
    let formattedMessage = message;
    
    if (this.options.includeTimestamp) {
      const timestamp = new Date().toISOString();
      formattedMessage = `[${timestamp}] ${formattedMessage}`;
    }
    
    if (this.options.prefix) {
      formattedMessage = `[${this.options.prefix}] ${formattedMessage}`;
    }
    
    const levelPrefix = level.toUpperCase();
    formattedMessage = `[${levelPrefix}] ${formattedMessage}`;
    
    return [formattedMessage, ...args];
  }

  /**
   * Log error messages - always shown
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('error', message, ...args);
      console.error(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Log warning messages - development only unless enabled
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('warn', message, ...args);
      console.warn(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Log info messages - development only unless enabled
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('info', message, ...args);
      console.info(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Log debug messages - development only
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('debug', message, ...args);
      //console.log(formattedMessage, ...formattedArgs);
    }
  }

  /**
   * Create a scoped logger with a specific prefix
   */
  scope(prefix: string): Logger {
    return new Logger({
      ...this.options,
      prefix: this.options.prefix ? `${this.options.prefix}:${prefix}` : prefix,
    });
  }
}

// Default logger instance
export const logger = new Logger();

// Scoped loggers for different parts of the application
export const authLogger = logger.scope('AUTH');
export const apiLogger = logger.scope('API');
export const dbLogger = logger.scope('DB');
export const surveyLogger = logger.scope('SURVEY');
export const guestLogger = logger.scope('GUEST');
export const adminLogger = logger.scope('ADMIN');

// Legacy console replacement (for gradual migration)
export const devLog = {
  log: (message: string, ...args: any[]) => logger.debug(message, ...args),
  error: (message: string, ...args: any[]) => logger.error(message, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
  info: (message: string, ...args: any[]) => logger.info(message, ...args),
};

// Production-safe assertion logging
export const safeLog = {
  /**
   * Only log sensitive data in development
   */
  sensitive: (message: string, data: any) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`${message}:`, data);
    }
  },
  
  /**
   * Log user actions for audit (sanitized)
   */
  audit: (action: string, userId?: string | number) => {
    logger.info(`User action: ${action}`, userId ? { userId } : {});
  },
  
  /**
   * Log API calls (without sensitive data)
   */
  api: (method: string, endpoint: string, status?: number) => {
    logger.info(`API ${method} ${endpoint}`, status ? { status } : {});
  },
};

export default logger;
