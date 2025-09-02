import { executeQuery } from '../config/db';

export async function up() {
  // Create daftar_tamu table
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
      bidang_tujuan_id int(11) DEFAULT NULL,
      catatan_tambahan text DEFAULT NULL,
      status_kunjungan enum('Menunggu','Terjadwal','Datang','Selesai') DEFAULT 'Menunggu',
      tujuan_kunjungan_id int(11) DEFAULT NULL,
      jadwal_checkin datetime DEFAULT NULL,
      waktu_checkin datetime DEFAULT NULL,
      waktu_checkout datetime DEFAULT NULL,
      file_upload varchar(255) DEFAULT NULL,
      waktu_dibuat datetime DEFAULT current_timestamp(),
      jadwal_dibuat datetime DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_tamu_nama (nama),
      KEY idx_tamu_asal_instansi (asal_instansi),
      KEY idx_tamu_status_kunjungan (status_kunjungan),
      KEY idx_tamu_jadwal_checkin (jadwal_checkin),
      KEY idx_tamu_waktu_checkin (waktu_checkin),
      KEY idx_tamu_waktu_checkout (waktu_checkout),
      KEY idx_tamu_waktu_dibuat (waktu_dibuat),
      KEY fk_tamu_pendidikan (pendidikan_terakhir_id),
      KEY fk_tamu_profesi (profesi_id),
      KEY fk_tamu_bidang (bidang_tujuan_id),
      KEY fk_tamu_tujuan (tujuan_kunjungan_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  // Create triggers for status updates (with existence checks)
  try {
    await executeQuery(`
      CREATE TRIGGER set_terjadwal BEFORE UPDATE ON daftar_tamu
      FOR EACH ROW
      BEGIN
        IF NEW.jadwal_checkin IS NOT NULL AND OLD.jadwal_checkin IS NULL THEN
          SET NEW.status_kunjungan = 'Terjadwal';
        END IF;
      END
    `);
  } catch (error: any) {
    if (error.code !== 'ER_TRG_ALREADY_EXISTS') {
      throw error;
    }
  }
  
  try {
    await executeQuery(`
      CREATE TRIGGER set_datang BEFORE UPDATE ON daftar_tamu
      FOR EACH ROW
      BEGIN
        IF NEW.waktu_checkin IS NOT NULL AND OLD.waktu_checkin IS NULL THEN
          SET NEW.status_kunjungan = 'Datang';
        END IF;
      END
    `);
  } catch (error: any) {
    if (error.code !== 'ER_TRG_ALREADY_EXISTS') {
      throw error;
    }
  }
  
  try {
    await executeQuery(`
      CREATE TRIGGER set_selesai BEFORE UPDATE ON daftar_tamu
      FOR EACH ROW
      BEGIN
        IF NEW.waktu_checkout IS NOT NULL AND OLD.waktu_checkout IS NULL THEN
          SET NEW.status_kunjungan = 'Selesai';
        END IF;
      END
    `);
  } catch (error: any) {
    if (error.code !== 'ER_TRG_ALREADY_EXISTS') {
      throw error;
    }
  }
  
  console.log('Daftar Tamu table and triggers created successfully');
}

export async function down() {
  // Drop triggers first
  await executeQuery(`DROP TRIGGER IF EXISTS set_terjadwal;`);
  await executeQuery(`DROP TRIGGER IF EXISTS set_datang;`);
  await executeQuery(`DROP TRIGGER IF EXISTS set_selesai;`);
  
  // Then drop the table
  await executeQuery(`DROP TABLE IF EXISTS daftar_tamu;`);
  console.log('Daftar Tamu table and triggers dropped successfully');
}