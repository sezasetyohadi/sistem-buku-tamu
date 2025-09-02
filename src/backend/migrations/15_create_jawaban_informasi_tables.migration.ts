import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating informasi-related tables...');
  
  // Create jawaban_memperoleh_informasi table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_memperoleh_informasi (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      cara_memperoleh_id int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY tamu_id (tamu_id),
      KEY cara_memperoleh_id (cara_memperoleh_id),
      FOREIGN KEY (tamu_id) REFERENCES daftar_tamu(id),
      FOREIGN KEY (cara_memperoleh_id) REFERENCES memperoleh_informasi(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban memperoleh informasi table created successfully');

  // Create jawaban_mendapatkan_salinan table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_mendapatkan_salinan (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      cara_salinan_id int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY tamu_id (tamu_id),
      KEY cara_salinan_id (cara_salinan_id),
      FOREIGN KEY (tamu_id) REFERENCES daftar_tamu(id),
      FOREIGN KEY (cara_salinan_id) REFERENCES mendapatkan_salinan(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban mendapatkan salinan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jawaban_mendapatkan_salinan;`);
  await executeQuery(`DROP TABLE IF EXISTS jawaban_memperoleh_informasi;`);
  console.log('Informasi-related tables dropped successfully');
}
