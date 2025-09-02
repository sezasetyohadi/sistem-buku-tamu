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
      pendidikan_terakhir_id int(11) NULL,
      pekerjaan_utama_id int(11) NULL,
      jenis_layanan_id int(11) NULL,
      saran text NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      nomor_telp varchar(20) NULL,
      PRIMARY KEY (id),
      KEY fk_pendidikan_responden (pendidikan_terakhir_id),
      KEY fk_profesi_responden (pekerjaan_utama_id),
      KEY fk_tujuan_responden (jenis_layanan_id),
      KEY fk_jenis_layanan (jenis_layanan_id),
      FOREIGN KEY (jenis_layanan_id) REFERENCES tujuan_kunjungan(id),
      FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir(id),
      FOREIGN KEY (pekerjaan_utama_id) REFERENCES profesi(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban identitas survei table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jawaban_identitas_survei;`);
  console.log('Jawaban identitas survei table dropped successfully');
}
