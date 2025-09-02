import { executeQuery } from '../config/db';

export async function up() {
  // Create jenis_rating table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jenis_rating (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_rating varchar(50) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jenis Rating table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jenis_rating;`);
  console.log('Jenis Rating table dropped successfully');
}
