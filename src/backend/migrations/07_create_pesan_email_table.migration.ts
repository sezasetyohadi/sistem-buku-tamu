import { executeQuery } from '../config/db';

export async function up() {
  // Create pesan_email table with foreign keys
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pesan_email (
      id int(11) NOT NULL AUTO_INCREMENT,
      tamu_id int(11) DEFAULT NULL,
      subjek varchar(255) DEFAULT NULL,
      isi_pesan text DEFAULT NULL,
      status_pengiriman enum('terkirim','gagal') DEFAULT NULL,
      waktu_kirim datetime DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY tamu_id (tamu_id),
      CONSTRAINT pesan_email_ibfk_2 FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pesan Email table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS pesan_email;`);
  console.log('Pesan Email table dropped successfully');
}
