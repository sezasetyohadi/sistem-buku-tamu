import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Creating survey tables...');
  
  // Create jawaban_identitas_survei table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_identitas_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) NOT NULL,
      nama varchar(100) NOT NULL,
      jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir varchar(100) DEFAULT NULL,
      asal_instansi varchar(100) DEFAULT NULL,
      waktu_dibuat timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY fk_identitas_tamu (tamu_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Identitas Survei table created successfully');

  // Create pertanyaan_survei table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pertanyaan_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      section_id int(11) DEFAULT 1,
      pertanyaan text NOT NULL,
      tipe_input enum('text','rating','multiple_choice') DEFAULT 'rating',
      is_required tinyint(1) DEFAULT 1,
      urutan int(11) DEFAULT 1,
      PRIMARY KEY (id),
      KEY fk_pertanyaan_section (section_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pertanyaan Survei table created successfully');

  // Create jawaban_survei table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      identitas_survei_id int(11) NOT NULL,
      pertanyaan_id int(11) NOT NULL,
      jawaban text DEFAULT NULL,
      rating_value int(11) DEFAULT NULL,
      waktu_dijawab timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY fk_jawaban_identitas (identitas_survei_id),
      KEY fk_jawaban_pertanyaan (pertanyaan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Survei table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jawaban_survei;`);
  await executeQuery(`DROP TABLE IF EXISTS pertanyaan_survei;`);
  await executeQuery(`DROP TABLE IF EXISTS jawaban_identitas_survei;`);
  console.log('Survey tables dropped successfully');
}
