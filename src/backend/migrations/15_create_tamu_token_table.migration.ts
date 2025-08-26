import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Creating tamu_token table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS tamu_token (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      token varchar(255) NOT NULL,
      tipe enum('verifikasi','reset') NOT NULL DEFAULT 'verifikasi',
      expires_at timestamp NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY fk_token_tamu (tamu_id),
      CONSTRAINT fk_token_tamu FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Tamu token table created successfully');
}

export async function down() {
  console.log('Starting down migration: Dropping tamu_token table...');
  
  await executeQuery(`DROP TABLE IF EXISTS tamu_token;`);
  
  console.log('Tamu token table dropped successfully');
}
