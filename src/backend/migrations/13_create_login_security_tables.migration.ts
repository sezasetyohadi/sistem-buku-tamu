import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Creating login security tables...');
  
  // Update admin table with security fields
  await executeQuery(`
    ALTER TABLE admin
    ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until DATETIME DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS last_failed_attempt DATETIME DEFAULT NULL
  `);
  
  console.log('Updated admin table with security fields');

  // Create login_attempts table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) DEFAULT NULL,
      ip_address varchar(50) DEFAULT NULL,
      user_agent text DEFAULT NULL,
      success tinyint(1) DEFAULT NULL,
      failure_reason varchar(255) DEFAULT NULL,
      attempt_time timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Created login_attempts table');
  
  // Create unlock_log table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS unlock_log (
      id int(11) NOT NULL AUTO_INCREMENT,
      admin_id int(11) DEFAULT NULL,
      admin_username varchar(50) DEFAULT NULL,
      unlocked_by int(11) DEFAULT NULL,
      unlock_time timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY fk_unlocked_admin (admin_id),
      KEY fk_unlocked_by (unlocked_by),
      CONSTRAINT fk_unlocked_admin FOREIGN KEY (admin_id) REFERENCES admin (id) ON DELETE SET NULL,
      CONSTRAINT fk_unlocked_by FOREIGN KEY (unlocked_by) REFERENCES admin (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Created unlock_log table');
  
  console.log('Login security tables created successfully');
}

export async function down() {
  console.log('Starting down migration: Removing login security tables...');
  
  // Drop unlock_log table
  await executeQuery(`DROP TABLE IF EXISTS unlock_log;`);
  
  // Drop login_attempts table
  await executeQuery(`DROP TABLE IF EXISTS login_attempts;`);
  
  // Remove security fields from admin table
  await executeQuery(`
    ALTER TABLE admin
    DROP COLUMN IF EXISTS failed_attempts,
    DROP COLUMN IF EXISTS locked_until,
    DROP COLUMN IF EXISTS last_failed_attempt
  `);
  
  console.log('Removed login security tables and fields');
}
