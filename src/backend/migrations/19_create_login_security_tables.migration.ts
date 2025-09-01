import { executeQuery } from '../config/db';

export async function up() {
  console.log('Adding security columns to admin table...');
  
  // Add security columns to existing admin table
  await executeQuery(`
    ALTER TABLE admin 
    ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL,
    ADD COLUMN IF NOT EXISTS last_failed_attempt DATETIME NULL
  `);

  console.log('Creating login_attempts table...');
  
  // Create login_attempts table for tracking all login attempts
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      ip_address VARCHAR(45) NOT NULL,
      user_agent TEXT,
      success BOOLEAN NOT NULL,
      failure_reason VARCHAR(255) NULL,
      attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_username_time (username, attempt_time),
      INDEX idx_ip_time (ip_address, attempt_time),
      INDEX idx_success (success)
    )
  `);

  console.log('Creating unlock_log table...');
  
  // Create unlock_log table for audit trail
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS unlock_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      unlock_method ENUM('auto', 'manual', 'admin') NOT NULL,
      unlock_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45) NULL,
      admin_username VARCHAR(50) NULL,
      INDEX idx_username_time (username, unlock_time)
    )
  `);

  console.log('Login security tables created successfully');
}

export async function down() {
  console.log('Removing login security tables...');
  
  // Drop tables
  await executeQuery('DROP TABLE IF EXISTS unlock_log');
  await executeQuery('DROP TABLE IF EXISTS login_attempts');
  
  // Remove security columns from admin table
  await executeQuery(`
    ALTER TABLE admin 
    DROP COLUMN IF EXISTS failed_attempts,
    DROP COLUMN IF EXISTS locked_until,
    DROP COLUMN IF EXISTS last_failed_attempt
  `);

  console.log('Login security tables removed successfully');
}
