import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating mendapatkan_salinan table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS mendapatkan_salinan (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_opsi varchar(255) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Mendapatkan salinan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS mendapatkan_salinan;`);
  console.log('Mendapatkan salinan table dropped successfully');
}
