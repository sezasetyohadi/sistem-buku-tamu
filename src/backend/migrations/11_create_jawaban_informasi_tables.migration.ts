import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Creating jawaban informasi tables...');
  
  // Create jawaban_memperoleh_informasi table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_memperoleh_informasi (
      id int(11) NOT NULL AUTO_INCREMENT,
      identitas_survei_id int(11) NOT NULL,
      memperoleh_informasi_id int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY fk_jawaban_memperoleh_identitas (identitas_survei_id),
      KEY fk_jawaban_memperoleh_info (memperoleh_informasi_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Memperoleh Informasi table created successfully');

  // Create jawaban_mendapatkan_salinan table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_mendapatkan_salinan (
      id int(11) NOT NULL AUTO_INCREMENT,
      identitas_survei_id int(11) NOT NULL,
      mendapatkan_salinan_id int(11) NOT NULL,
      PRIMARY KEY (id),
      KEY fk_jawaban_salinan_identitas (identitas_survei_id),
      KEY fk_jawaban_salinan_info (mendapatkan_salinan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Mendapatkan Salinan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jawaban_mendapatkan_salinan;`);
  await executeQuery(`DROP TABLE IF EXISTS jawaban_memperoleh_informasi;`);
  console.log('Jawaban informasi tables dropped successfully');
}
