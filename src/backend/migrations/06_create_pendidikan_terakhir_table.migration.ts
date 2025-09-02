import { executeQuery } from '../config/db';

export async function up() {
  // Create pendidikan_terakhir table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pendidikan_terakhir (
      id int(11) NOT NULL AUTO_INCREMENT,
      pendidikan_terakhir varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pendidikan Terakhir table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS pendidikan_terakhir;`);
  console.log('Pendidikan Terakhir table dropped successfully');
}
