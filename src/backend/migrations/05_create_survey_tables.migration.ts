import { executeQuery } from '../config/db';

export async function up() {
  // Create jawaban_identitas_survei table to store survey respondent information
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_identitas_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      tanggal_survei date NOT NULL,
      nama_lengkap varchar(100) NOT NULL,
      umur int(11) NOT NULL,
      email varchar(100) NOT NULL,
      nomor_telepon varchar(20) NOT NULL,
      jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
      alamat text NOT NULL,
      pendidikan_terakhir_id varchar(100) NOT NULL,
      pekerjaan_utama_id varchar(100) NOT NULL,
      jenis_layanan_id varchar(100) NOT NULL,
      saran text DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Identitas Survei table created successfully');
  
  // Create pertanyaan_survei table first as it's referenced by jawaban_survei
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pertanyaan_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      section_id int(11) DEFAULT NULL,
      urutan int(11) DEFAULT 1,
      pertanyaan text NOT NULL,
      jenis_rating_id int(11) DEFAULT NULL,
      max_rating int(11) DEFAULT 1,
      is_aktif tinyint(1) DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY section_id (section_id),
      KEY fk_jenis_rating (jenis_rating_id),
      CONSTRAINT pertanyaan_survei_ibfk_1 FOREIGN KEY (section_id) REFERENCES section_survei (id) ON DELETE SET NULL,
      CONSTRAINT fk_jenis_rating FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pertanyaan Survei table created successfully');
  
  // Create jawaban_survei table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      responden_id int(11) DEFAULT NULL,
      pertanyaan_id int(11) NOT NULL,
      jawaban int(11) NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY pertanyaan_id (pertanyaan_id),
      CONSTRAINT jawaban_survei_ibfk_1 FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban Survei table created successfully');
}

export async function down() {
  // Drop jawaban_survei first due to foreign key constraint
  await executeQuery(`DROP TABLE IF EXISTS jawaban_survei;`);
  console.log('Jawaban Survei table dropped successfully');
  
  await executeQuery(`DROP TABLE IF EXISTS pertanyaan_survei;`);
  console.log('Pertanyaan Survei table dropped successfully');
  
  await executeQuery(`DROP TABLE IF EXISTS jawaban_identitas_survei;`);
  console.log('Jawaban Identitas Survei table dropped successfully');
}
