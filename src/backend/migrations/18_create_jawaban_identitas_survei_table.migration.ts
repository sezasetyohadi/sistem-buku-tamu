import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating jawaban_identitas_survei table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_identitas_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_lengkap varchar(100) NOT NULL,
      tanggal_lahir date NOT NULL,
      email varchar(100) NOT NULL,
      nomor_telepon varchar(20) NOT NULL,
      jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
      alamat text NOT NULL,
      pendidikan_terakhir_id int(11) DEFAULT NULL,
      pekerjaan_utama_id int(11) DEFAULT NULL,
      jenis_layanan_id int(11) DEFAULT NULL,
      saran text DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY fk_pendidikan_responden (pendidikan_terakhir_id),
      KEY fk_profesi_responden (pekerjaan_utama_id),
      KEY fk_tujuan_responden (jenis_layanan_id),
      CONSTRAINT fk_pendidikan_responden FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir (id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT fk_profesi_responden FOREIGN KEY (pekerjaan_utama_id) REFERENCES profesi (id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT fk_tujuan_responden FOREIGN KEY (jenis_layanan_id) REFERENCES tujuan_kunjungan (id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban_identitas_survei table created successfully');
}

export async function down() {
  await executeQuery('DROP TABLE IF EXISTS jawaban_identitas_survei;');
  console.log('Jawaban_identitas_survei table dropped successfully');
}
