import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating jenis_rating table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jenis_rating (
      id int(11) NOT NULL AUTO_INCREMENT,
      tipe enum('rating','text') NOT NULL DEFAULT 'rating',
      nama_rating varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO jenis_rating (id, tipe, nama_rating) VALUES
    (1, 'rating', 'Skala 5'),
    (2, 'rating', 'Skala 3'),
    (3, 'text', 'Text'),
    (4, 'rating', 'Kinerja'),
    (5, 'rating', 'Tingkat Kepentingan');
  `);
  
  console.log('Jenis_rating table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jenis_rating;`);
  console.log('Jenis_rating table dropped successfully');
}
