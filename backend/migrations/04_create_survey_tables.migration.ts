import { executeQuery } from '../config/db';

export async function up() {
  // Create pertanyaan_survei table first as it's referenced by jawaban_survei
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pertanyaan_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      pertanyaan text NOT NULL,
      is_aktif tinyint(1) DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pertanyaan Survei table created successfully');
  
  // Create jawaban_survei table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_lengkap varchar(100) NOT NULL,
      jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir varchar(100) DEFAULT NULL,
      profesi varchar(100) DEFAULT NULL,
      instansi varchar(100) DEFAULT NULL,
      pertanyaan_id int(11) NOT NULL,
      jawaban int(11) NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      saran text DEFAULT NULL,
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
}
