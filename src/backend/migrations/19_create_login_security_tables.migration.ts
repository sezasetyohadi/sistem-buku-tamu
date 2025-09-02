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
      ip_address VARCHAR(45),
      user_agent TEXT,
      attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN DEFAULT FALSE,
      failure_reason VARCHAR(255),
      INDEX idx_username (username),
      INDEX idx_attempt_time (attempt_time),
      INDEX idx_ip_address (ip_address)
    );
  `);

  console.log('Creating unlock_log table...');
  
  // Create unlock_log table for tracking manual unlocks
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS unlock_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      unlocked_by_admin_id INT,
      unlock_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      unlock_reason VARCHAR(255),
      FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE,
      FOREIGN KEY (unlocked_by_admin_id) REFERENCES admin(id) ON DELETE SET NULL,
      INDEX idx_admin_id (admin_id),
      INDEX idx_unlock_time (unlock_time)
    );
  `);

  console.log('Login security tables created successfully');
}

export async function down() {
  console.log('Removing login security tables and columns...');
  
  // Drop tables first
  await executeQuery(`DROP TABLE IF EXISTS unlock_log;`);
  await executeQuery(`DROP TABLE IF EXISTS login_attempts;`);
  
  // Remove security columns from admin table
  await executeQuery(`
    ALTER TABLE admin 
    DROP COLUMN IF EXISTS failed_attempts,
    DROP COLUMN IF EXISTS locked_until,
    DROP COLUMN IF EXISTS last_failed_attempt;
  `);
  
  console.log('Login security tables and columns removed successfully');
}
