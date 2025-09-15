import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating login_attempts table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) NOT NULL,
      ip_address varchar(45) NOT NULL,
      user_agent text DEFAULT NULL,
      success tinyint(1) NOT NULL,
      failure_reason varchar(255) DEFAULT NULL,
      attempt_time timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_username_time (username, attempt_time),
      KEY idx_ip_time (ip_address, attempt_time),
      KEY idx_success (success)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Login_attempts table created successfully');
}

export async function down() {
  await executeQuery('DROP TABLE IF EXISTS login_attempts;');
  console.log('Login_attempts table dropped successfully');
}
