import { executeQuery } from '../config/db';

export async function up() {
  // Create jawaban_memperoleh_informasi table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_memperoleh_informasi (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      cara_memperoleh_id int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY cara_memperoleh_id (cara_memperoleh_id),
      CONSTRAINT jawaban_memperoleh_informasi_ibfk_1 FOREIGN KEY (cara_memperoleh_id) REFERENCES memperoleh_informasi (id) ON DELETE CASCADE,
      CONSTRAINT jawaban_memperoleh_informasi_ibfk_2 FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Memperoleh Informasi table created successfully');
  
  // Create jawaban_mendapatkan_salinan table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_mendapatkan_salinan (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      cara_salinan_id int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY cara_salinan_id (cara_salinan_id),
      CONSTRAINT jawaban_mendapatkan_salinan_ibfk_1 FOREIGN KEY (cara_salinan_id) REFERENCES mendapatkan_salinan (id) ON DELETE CASCADE,
      CONSTRAINT jawaban_mendapatkan_salinan_ibfk_2 FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Mendapatkan Salinan table created successfully');
}

export async function down() {
  // Drop tables in reverse order
  await executeQuery(`DROP TABLE IF EXISTS jawaban_mendapatkan_salinan;`);
  console.log('Jawaban Mendapatkan Salinan table dropped successfully');
  
  await executeQuery(`DROP TABLE IF EXISTS jawaban_memperoleh_informasi;`);
  console.log('Jawaban Memperoleh Informasi table dropped successfully');
}
