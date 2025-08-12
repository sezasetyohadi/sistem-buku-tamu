import { executeQuery } from '../config/db';

export async function up() {
  // Create section_survei table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS section_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_section varchar(255) NOT NULL,
      urutan int(11) DEFAULT 1,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Section Survei table created successfully');
}

export async function down() {
  // Drop section_survei table
  await executeQuery(`DROP TABLE IF EXISTS section_survei;`);
  console.log('Section Survei table dropped successfully');
}
