import { executeQuery } from '../config/db';

export async function up() {
  // Create pesan_email table with foreign keys
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pesan_email (
      id int(11) NOT NULL AUTO_INCREMENT,
      admin_id int(11) NOT NULL,
      tamu_id int(11) NOT NULL,
      subjek varchar(255) NOT NULL,
      isi_pesan text NOT NULL,
      status_pengiriman enum('terkirim','gagal') DEFAULT NULL,
      waktu_kirim datetime DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY admin_id (admin_id),
      KEY tamu_id (tamu_id),
      CONSTRAINT pesan_email_ibfk_1 FOREIGN KEY (admin_id) REFERENCES admin (id) ON DELETE CASCADE,
      CONSTRAINT pesan_email_ibfk_2 FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pesan Email table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS pesan_email;`);
  console.log('Pesan Email table dropped successfully');
}
