import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating opsi_rating table...');
  
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
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO opsi_rating (id, jenis_rating_id, skala_rating, urutan_rating) VALUES
    (1, 1, 'Sangat Baik', 1),
    (2, 1, 'Baik', 2),
    (3, 1, 'Cukup', 3),
    (4, 1, 'Kurang', 4),
    (5, 1, 'Sangat Kurang', 5),
    (6, 2, 'Memuaskan', 1),
    (7, 2, 'Cukup', 2),
    (8, 2, 'Kurang Memuaskan', 3),
    (9, 4, 'Tidak Sesuai', 1),
    (10, 4, 'Kurang Sesuai', 2),
    (11, 4, 'Sesuai', 3),
    (12, 4, 'Sangat Sesuai', 4),
    (13, 5, 'Tidak Penting', 1),
    (14, 5, 'Kurang Penting', 2),
    (15, 5, 'Penting', 3),
    (16, 5, 'Sangat Penting', 4);
  `);
  
  console.log('Opsi_rating table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS opsi_rating;`);
  console.log('Opsi_rating table dropped successfully');
}
