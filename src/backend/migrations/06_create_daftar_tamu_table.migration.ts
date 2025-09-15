import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating daftar_tamu table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS daftar_tamu (
      id int(11) NOT NULL AUTO_INCREMENT,
      email varchar(100) DEFAULT NULL,
      nama varchar(100) NOT NULL,
      nomor_telp varchar(20) DEFAULT NULL,
      alamat text DEFAULT NULL,
      jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir_id int(11) DEFAULT NULL,
      profesi_id int(11) DEFAULT NULL,
      asal_instansi varchar(100) DEFAULT NULL,
      keperluan text DEFAULT NULL,
      catatan_tambahan text DEFAULT NULL,
      status_kunjungan enum('Menunggu','Terjadwal','Datang','Selesai') NOT NULL DEFAULT 'Menunggu',
      jadwal_checkin datetime DEFAULT NULL,
      waktu_checkin datetime DEFAULT NULL,
      waktu_checkout datetime DEFAULT NULL,
      file_upload varchar(255) DEFAULT NULL,
      waktu_dibuat datetime DEFAULT current_timestamp(),
      jadwal_dibuat datetime DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_tamu_nama (nama),
      KEY idx_tamu_instansi (asal_instansi),
      KEY idx_tamu_status (status_kunjungan),
      KEY idx_tamu_waktu_dibuat (waktu_dibuat),
      KEY idx_tamu_jadwal_checkin (jadwal_checkin),
      KEY idx_tamu_waktu_checkin (waktu_checkin),
      KEY idx_tamu_waktu_checkout (waktu_checkout),
      KEY fk_tamu_pendidikan (pendidikan_terakhir_id),
      KEY fk_tamu_profesi (profesi_id),
      CONSTRAINT fk_tamu_pendidikan FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir (id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT fk_tamu_profesi FOREIGN KEY (profesi_id) REFERENCES profesi (id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Daftar_tamu table created successfully');
}

export async function down() {
  await executeQuery('DROP TABLE IF EXISTS daftar_tamu;');
  console.log('Daftar_tamu table dropped successfully');
}
