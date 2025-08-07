import { executeQuery } from '../config/db';

export async function up() {
  // Create daftar_tamu table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS daftar_tamu (
      id int(11) NOT NULL AUTO_INCREMENT,
      email varchar(100) DEFAULT NULL,
      nama varchar(100) NOT NULL,
      nomor_telp VARCHAR(20) DEFAULT NULL,
      alamat text DEFAULT NULL,
      jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir varchar(100) DEFAULT NULL,
      profesi varchar(100) DEFAULT NULL,
      asal_instansi varchar(100) DEFAULT NULL,
      keperluan text DEFAULT NULL,
      tanggapan enum('Check-in','Check-out','Menunggu') DEFAULT NULL,
      file_upload varchar(255) DEFAULT NULL,
      waktu_dibuat datetime DEFAULT current_timestamp(),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Daftar Tamu table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS daftar_tamu;`);
  console.log('Daftar Tamu table dropped successfully');
}
