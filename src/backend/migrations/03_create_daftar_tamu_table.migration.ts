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
      pendidikan_terakhir varchar(100) DEFAULT NULL,
      profesi varchar(100) DEFAULT NULL,
      asal_instansi varchar(100) DEFAULT NULL,
      keperluan text DEFAULT NULL,
      bidang_tujuan_id int(11) DEFAULT NULL,
      catatan_tambahan text DEFAULT NULL,
      status_kunjungan enum('Menunggu','Terjadwal','Datang','Selesai') NOT NULL DEFAULT 'Menunggu',
      jadwal_checkin datetime DEFAULT NULL,
      waktu_checkin datetime DEFAULT NULL,
      waktu_checkout datetime DEFAULT NULL,
      file_upload varchar(255) DEFAULT NULL,
      waktu_dibuat datetime DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY fk_bidang_tujuan (bidang_tujuan_id),
      CONSTRAINT fk_bidang_tujuan FOREIGN KEY (bidang_tujuan_id) REFERENCES bidang_tujuan (id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  // Create triggers for status updates exactly as in the SQL dump
  await executeQuery(`
    CREATE TRIGGER IF NOT EXISTS set_terjadwal BEFORE UPDATE ON daftar_tamu
    FOR EACH ROW
    BEGIN
      IF NEW.jadwal_checkin IS NOT NULL 
      END IF;
    END;
  `);
  
  await executeQuery(`
    CREATE TRIGGER IF NOT EXISTS set_datang BEFORE UPDATE ON daftar_tamu
    FOR EACH ROW
    BEGIN
      IF NEW.waktu_checkin IS NOT NULL
      END IF;
    END;
  `);
  
  await executeQuery(`
    CREATE TRIGGER IF NOT EXISTS set_selesai BEFORE UPDATE ON daftar_tamu
    FOR EACH ROW
    BEGIN
      IF NEW.waktu_checkout IS NOT NULL
      END IF;
    END;
  `);
  
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
