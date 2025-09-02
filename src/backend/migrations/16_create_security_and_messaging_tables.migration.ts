import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating security and messaging tables...');
  
  // Create tamu_token table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS tamu_token (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      token varchar(15) NOT NULL,
      is_active tinyint(1) NOT NULL DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY token (token),
      KEY tamu_id (tamu_id),
      FOREIGN KEY (tamu_id) REFERENCES daftar_tamu(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Tamu token table created successfully');

  // Create pesan_email table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pesan_email (
      id int(11) NOT NULL AUTO_INCREMENT,
      admin_id int(11) NOT NULL,
      tamu_id int(11) NOT NULL,
      subjek varchar(255) NOT NULL,
      isi_pesan text NOT NULL,
      status_pengiriman enum('terkirim','gagal') NULL,
      waktu_kirim datetime NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY admin_id (admin_id),
      KEY tamu_id (tamu_id),
      FOREIGN KEY (admin_id) REFERENCES admin(id),
      FOREIGN KEY (tamu_id) REFERENCES daftar_tamu(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pesan email table created successfully');

  // Create login_attempts table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) NOT NULL,
      ip_address varchar(45) NOT NULL,
      user_agent text NULL,
      success tinyint(1) NOT NULL,
      failure_reason varchar(255) NULL,
      attempt_time timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_username_time (username, attempt_time),
      KEY idx_ip_time (ip_address, attempt_time),
      KEY idx_success (success)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Login attempts table created successfully');

  // Create unlock_log table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS unlock_log (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) NOT NULL,
      unlock_method enum('auto','manual','admin') NOT NULL,
      unlock_time timestamp NOT NULL DEFAULT current_timestamp(),
      ip_address varchar(45) NULL,
      admin_username varchar(50) NULL,
      PRIMARY KEY (id),
      KEY idx_username_time (username, unlock_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Unlock log table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS unlock_log;`);
  await executeQuery(`DROP TABLE IF EXISTS login_attempts;`);
  await executeQuery(`DROP TABLE IF EXISTS pesan_email;`);
  await executeQuery(`DROP TABLE IF EXISTS tamu_token;`);
  console.log('Security and messaging tables dropped successfully');
}
