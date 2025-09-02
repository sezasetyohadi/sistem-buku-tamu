import { executeQuery } from '../config/db';

export async function up() {
  // Create profesi table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS profesi (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_profesi varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Profesi table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS profesi;`);
  console.log('Profesi table dropped successfully');
}
