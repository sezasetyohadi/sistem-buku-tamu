import { executeQuery } from '../config/db';

export async function up() {
  // Create tujuan_kunjungan table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS tujuan_kunjungan (
      id int(11) NOT NULL AUTO_INCREMENT,
      tujuan varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Tujuan Kunjungan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS tujuan_kunjungan;`);
  console.log('Tujuan Kunjungan table dropped successfully');
}
