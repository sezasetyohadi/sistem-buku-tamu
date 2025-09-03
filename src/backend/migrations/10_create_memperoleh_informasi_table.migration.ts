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
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO memperoleh_informasi (id, nama_opsi) VALUES
    (1, 'Melihat/membaca/mendengarkan/mencatat'),
    (2, 'Mendapatkan salinan informasi');
  `);
  
  console.log('Memperoleh_informasi table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS memperoleh_informasi;`);
  console.log('Memperoleh_informasi table dropped successfully');
}
