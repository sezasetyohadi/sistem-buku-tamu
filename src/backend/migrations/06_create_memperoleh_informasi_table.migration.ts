import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating memperoleh_informasi table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS memperoleh_informasi (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_opsi varchar(255) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Memperoleh informasi table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS memperoleh_informasi;`);
  console.log('Memperoleh informasi table dropped successfully');
}
