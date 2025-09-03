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
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO mendapatkan_salinan (id, nama_opsi) VALUES
    (1, 'Mengambil langsung'),
    (2, 'Kurir'),
    (3, 'Pos'),
    (4, 'Faksimili'),
    (5, 'E-mail');
  `);
  
  console.log('Mendapatkan_salinan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS mendapatkan_salinan;`);
  console.log('Mendapatkan_salinan table dropped successfully');
}
