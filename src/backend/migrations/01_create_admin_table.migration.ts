import { executeQuery } from '../config/db';

export async function up() {
  // Create admin table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS admin (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) NOT NULL,
      email varchar(100) NOT NULL,
      password varchar(255) NOT NULL,
      nama_lengkap varchar(100) NOT NULL,
      created_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY unique_username (username),
      UNIQUE KEY unique_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Admin table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS admin;`);
  console.log('Admin table dropped successfully');
}
