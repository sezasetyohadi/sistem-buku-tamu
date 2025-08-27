import { PoolConnection } from 'mysql2/promise';

interface LoginAttempt {
  username: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

interface SecurityStatus {
  isLocked: boolean;
  attemptsRemaining: number;
  lockoutExpiresAt?: Date;
  nextAttemptDelay: number; // in seconds
}

export class LoginSecurityService {
  private connection: PoolConnection;

  // Security configuration
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;
  private readonly PROGRESSIVE_DELAYS = [0, 1, 5, 10, 30]; // seconds

  constructor(connection: PoolConnection) {
    this.connection = connection;
  }

  /**
   * Check if user/IP can attempt login
   */
  async checkLoginPermission(username: string, ipAddress: string): Promise<SecurityStatus> {
    // Auto-unlock expired locks first
    await this.autoUnlockExpiredAccounts();

    // Check user-specific lock status
    const [userRows] = await this.connection.execute(
      'SELECT failed_attempts, locked_until FROM admin WHERE username = ?',
      [username]
    );

    const user = (userRows as any[])[0];
    if (!user) {
      throw new Error('Username or password is incorrect');
    }

    // Check if account is currently locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return {
        isLocked: true,
        attemptsRemaining: 0,
        lockoutExpiresAt: new Date(user.locked_until),
        nextAttemptDelay: 0
      };
    }

    // Check recent attempts from this IP (last hour)
    const [ipAttempts] = await this.connection.execute(`
      SELECT COUNT(*) as count FROM login_attempts 
      WHERE ip_address = ? 
      AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND success = FALSE
    `, [ipAddress]);

    const ipFailures = (ipAttempts as any[])[0].count;
    
    // Block IP if too many failures
    if (ipFailures >= 20) {
      throw new Error('Too many failed attempts from this network. Please try again later.');
    }

    const attemptsRemaining = Math.max(0, this.MAX_ATTEMPTS - user.failed_attempts);
    const nextDelay = this.getProgressiveDelay(user.failed_attempts);

    return {
      isLocked: false,
      attemptsRemaining,
      lockoutExpiresAt: undefined,
      nextAttemptDelay: nextDelay
    };
  }

  /**
   * Record login attempt
   */
  async recordLoginAttempt(attemptData: LoginAttempt): Promise<void> {
    const { username, ipAddress, userAgent, success, failureReason } = attemptData;

    // Log the attempt
    await this.connection.execute(`
      INSERT INTO login_attempts (username, ip_address, user_agent, success, failure_reason) 
      VALUES (?, ?, ?, ?, ?)
    `, [username, ipAddress, userAgent, success, failureReason || null]);

    if (success) {
      // Clear failed attempts on success
      await this.connection.execute(
        'UPDATE admin SET failed_attempts = 0, locked_until = NULL, last_failed_attempt = NULL WHERE username = ?',
        [username]
      );
    } else {
      // Increment failed attempts
      await this.connection.execute(`
        UPDATE admin SET 
          failed_attempts = failed_attempts + 1,
          last_failed_attempt = NOW()
        WHERE username = ?
      `, [username]);

      // Check if we need to lock the account
      const [userRows] = await this.connection.execute(
        'SELECT failed_attempts FROM admin WHERE username = ?',
        [username]
      );

      const user = (userRows as any[])[0];
      if (user && user.failed_attempts >= this.MAX_ATTEMPTS) {
        await this.lockAccount(username);
      }
    }
  }

  /**
   * Lock account for specified duration
   */
  private async lockAccount(username: string): Promise<void> {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES);

    await this.connection.execute(
      'UPDATE admin SET locked_until = ? WHERE username = ?',
      [lockUntil, username]
    );

    console.log(`🔒 Account ${username} locked until ${lockUntil.toISOString()}`);
  }

  /**
   * Auto-unlock accounts with expired locks
   */
  private async autoUnlockExpiredAccounts(): Promise<void> {
    const [unlockedRows] = await this.connection.execute(`
      UPDATE admin SET 
        locked_until = NULL, 
        failed_attempts = 0,
        last_failed_attempt = NULL
      WHERE locked_until IS NOT NULL 
      AND locked_until < NOW()
    `);

    const unlockedCount = (unlockedRows as any).affectedRows;
    if (unlockedCount > 0) {
      // Log auto-unlocks
      await this.connection.execute(`
        INSERT INTO unlock_log (username, unlock_method, ip_address)
        SELECT username, 'auto', 'system'
        FROM admin 
        WHERE failed_attempts = 0 
        AND locked_until IS NULL 
        AND last_failed_attempt IS NULL
        LIMIT ?
      `, [unlockedCount]);

      console.log(`🔓 Auto-unlocked ${unlockedCount} expired accounts`);
    }
  }

  /**
   * Get progressive delay based on attempt count
   */
  private getProgressiveDelay(attemptCount: number): number {
    if (attemptCount < this.PROGRESSIVE_DELAYS.length) {
      return this.PROGRESSIVE_DELAYS[attemptCount];
    }
    return this.PROGRESSIVE_DELAYS[this.PROGRESSIVE_DELAYS.length - 1];
  }

  /**
   * Get security statistics for monitoring
   */
  async getSecurityStats(): Promise<any> {
    const [lockedAccounts] = await this.connection.execute(
      'SELECT COUNT(*) as count FROM admin WHERE locked_until > NOW()'
    );

    const [recentAttempts] = await this.connection.execute(`
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN success = TRUE THEN 1 ELSE 0 END) as successful_attempts,
        SUM(CASE WHEN success = FALSE THEN 1 ELSE 0 END) as failed_attempts
      FROM login_attempts 
      WHERE attempt_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    const [topFailingIPs] = await this.connection.execute(`
      SELECT 
        ip_address, 
        COUNT(*) as attempt_count
      FROM login_attempts 
      WHERE success = FALSE 
      AND attempt_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY ip_address 
      ORDER BY attempt_count DESC 
      LIMIT 10
    `);

    return {
      lockedAccounts: (lockedAccounts as any[])[0].count,
      last24Hours: (recentAttempts as any[])[0],
      topFailingIPs: topFailingIPs
    };
  }
}
