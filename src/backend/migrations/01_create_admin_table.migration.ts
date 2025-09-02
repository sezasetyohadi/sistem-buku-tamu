import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating admin table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS admin (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) NOT NULL,
      password varchar(255) NOT NULL,
      nama_lengkap varchar(100) NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      email varchar(100) NULL,
      profile_picture varchar(255) NULL,
      is_super_admin tinyint(1) NULL,
      failed_attempts int(11) NULL DEFAULT 0,
      locked_until datetime NULL,
      last_failed_attempt datetime NULL,
      updated_at timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Admin table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS admin;`);
  console.log('Admin table dropped successfully');
}
