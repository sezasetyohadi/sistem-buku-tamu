import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating unlock_log table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS unlock_log (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) NOT NULL,
      unlock_method enum('auto','manual','admin') NOT NULL,
      unlock_time timestamp NOT NULL DEFAULT current_timestamp(),
      ip_address varchar(45) DEFAULT NULL,
      admin_username varchar(50) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_username_time (username, unlock_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Unlock_log table created successfully');
}

export async function down() {
  await executeQuery('DROP TABLE IF EXISTS unlock_log;');
  console.log('Unlock_log table dropped successfully');
}
