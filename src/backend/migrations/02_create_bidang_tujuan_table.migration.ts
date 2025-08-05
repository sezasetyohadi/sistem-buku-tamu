import { executeQuery } from '../config/db';

export async function up() {
  // Create bidang_tujuan table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS bidang_tujuan (
      id int(11) NOT NULL AUTO_INCREMENT,
      bidang varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Bidang Tujuan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS bidang_tujuan;`);
  console.log('Bidang Tujuan table dropped successfully');
}
