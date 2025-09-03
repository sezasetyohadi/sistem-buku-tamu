import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating bidang_tujuan table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS bidang_tujuan (
      id int(11) NOT NULL AUTO_INCREMENT,
      bidang varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO bidang_tujuan (id, bidang) VALUES
    (1, 'Sekretariat'),
    (2, 'Bidang Pelatihan Kerja'),
    (3, 'Bidang Penempatan Tenaga Kerja'),
    (4, 'Bidang Hubungan Industrial'),
    (5, 'Bidang Norma Kerja'),
    (6, 'Bidang Transmigrasi'),
    (7, 'Kepala Dinas');
  `);
  
  console.log('Bidang_tujuan table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS bidang_tujuan;`);
  console.log('Bidang_tujuan table dropped successfully');
}
