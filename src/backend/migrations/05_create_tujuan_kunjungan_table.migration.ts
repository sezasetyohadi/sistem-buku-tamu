import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating tujuan_kunjungan table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS tujuan_kunjungan (
      id int(11) NOT NULL AUTO_INCREMENT,
      tujuan varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO tujuan_kunjungan (id, tujuan) VALUES
    (1, 'Konsultasi Layanan'),
    (2, 'Pengaduan/Keluhan'),
    (3, 'Pengajuan Permohonan'),
    (4, 'Mencari Informasi'),
    (5, 'Meeting/Rapat'),
    (6, 'Survey/Penelitian');
  `);
  
  console.log('Tujuan_kunjungan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS tujuan_kunjungan;`);
  console.log('Tujuan_kunjungan table dropped successfully');
}
