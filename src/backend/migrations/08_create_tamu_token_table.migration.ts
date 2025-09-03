import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating tamu_token table...');
  
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
      CONSTRAINT tamu_token_ibfk_1 FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Tamu_token table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS tamu_token;`);
  console.log('Tamu_token table dropped successfully');
}
