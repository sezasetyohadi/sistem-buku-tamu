import { executeQuery } from '../config/db';

export async function up() {
  // Create jenis_rating table first
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jenis_rating (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_rating varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jenis Rating table created successfully');
  
  // Create opsi_rating table with foreign key
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS opsi_rating (
      id int(11) NOT NULL AUTO_INCREMENT,
      jenis_rating_id int(11) NOT NULL,
      skala_rating varchar(50) NOT NULL,
      urutan_rating int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY jenis_rating_id (jenis_rating_id),
      CONSTRAINT opsi_rating_ibfk_1 FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Opsi Rating table created successfully');
}

export async function down() {
  // Drop opsi_rating first due to foreign key constraint
  await executeQuery(`DROP TABLE IF EXISTS opsi_rating;`);
  console.log('Opsi Rating table dropped successfully');
  
  await executeQuery(`DROP TABLE IF EXISTS jenis_rating;`);
  console.log('Jenis Rating table dropped successfully');
}
