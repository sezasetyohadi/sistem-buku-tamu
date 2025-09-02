import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating rating system tables...');
  
  // Create jenis_rating table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jenis_rating (
      id int(11) NOT NULL AUTO_INCREMENT,
      tipe enum('rating','text') NOT NULL DEFAULT 'rating',
      nama_rating varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jenis rating table created successfully');

  // Create opsi_rating table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS opsi_rating (
      id int(11) NOT NULL AUTO_INCREMENT,
      jenis_rating_id int(11) NOT NULL,
      skala_rating varchar(50) NOT NULL,
      urutan_rating int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY jenis_rating_id (jenis_rating_id),
      FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Opsi rating table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS opsi_rating;`);
  await executeQuery(`DROP TABLE IF EXISTS jenis_rating;`);
  console.log('Rating tables dropped successfully');
}
