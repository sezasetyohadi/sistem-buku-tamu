import { executeQuery } from '../config/db';

export async function up() {
  // Create pesan_email table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pesan_email (
      id int(11) NOT NULL AUTO_INCREMENT,
      admin_id int(11) DEFAULT NULL,
      tamu_id int(11) DEFAULT NULL,
      subject varchar(255) NOT NULL,
      message text NOT NULL,
      sent_at timestamp NULL DEFAULT current_timestamp(),
      status enum('pending','sent','failed') DEFAULT 'pending',
      PRIMARY KEY (id),
      KEY fk_email_admin (admin_id),
      KEY fk_email_tamu (tamu_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pesan Email table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS pesan_email;`);
  console.log('Pesan Email table dropped successfully');
}
