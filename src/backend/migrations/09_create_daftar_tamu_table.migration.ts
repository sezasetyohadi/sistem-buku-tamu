import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating daftar_tamu table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS daftar_tamu (
      id int(11) NOT NULL AUTO_INCREMENT,
      email varchar(100) NULL,
      nama varchar(100) NOT NULL,
      nomor_telp varchar(20) NULL,
      alamat text NULL,
      jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir_id int(11) NULL,
      profesi_id int(11) NULL,
      asal_instansi varchar(100) NULL,
      keperluan text NULL,
      bidang_tujuan_id int(11) NULL,
      catatan_tambahan text NULL,
      status_kunjungan enum('Menunggu','Terjadwal','Datang','Selesai') NOT NULL DEFAULT 'Menunggu',
      jadwal_checkin datetime NULL,
      waktu_checkin datetime NULL,
      waktu_checkout datetime NULL,
      file_upload varchar(255) NULL,
      waktu_dibuat datetime NULL DEFAULT current_timestamp(),
      jadwal_dibuat datetime NULL,
      tujuan_kunjungan_id int(11) NULL,
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
      KEY fk_tamu_tujuan (tujuan_kunjungan_id),
      KEY fk_bidang_tujuan (bidang_tujuan_id),
      FOREIGN KEY (bidang_tujuan_id) REFERENCES bidang_tujuan(id),
      FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir(id),
      FOREIGN KEY (profesi_id) REFERENCES profesi(id),
      FOREIGN KEY (tujuan_kunjungan_id) REFERENCES tujuan_kunjungan(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Daftar tamu table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS daftar_tamu;`);
  console.log('Daftar tamu table dropped successfully');
}
