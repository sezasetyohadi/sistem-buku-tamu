import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating pertanyaan_survei table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pertanyaan_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      baris int(11) NOT NULL,
      pertanyaan text NOT NULL,
      is_aktif tinyint(1) DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pertanyaan_survei table created successfully');
}

export async function down() {
  await executeQuery('DROP TABLE IF EXISTS pertanyaan_survei;');
  console.log('Pertanyaan_survei table dropped successfully');
}
