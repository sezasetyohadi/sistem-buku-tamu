import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Creating tamu_token table...');
  
  // Create tamu_token table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS tamu_token (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      token varchar(255) NOT NULL,
      expires_at datetime NOT NULL,
      is_active tinyint(1) DEFAULT 1,
      created_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY unique_token (token),
      KEY fk_token_tamu (tamu_id),
      KEY idx_token_expires (expires_at),
      KEY idx_token_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Tamu token table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS tamu_token;`);
  console.log('Tamu token table dropped successfully');
}
