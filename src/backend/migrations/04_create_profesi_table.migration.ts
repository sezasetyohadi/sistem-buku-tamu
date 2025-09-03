import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating profesi table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS profesi (
      id int(11) NOT NULL AUTO_INCREMENT,
      nama_profesi varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO profesi (id, nama_profesi) VALUES
    (1, 'PNS'),
    (2, 'Wiraswasta'),
    (3, 'Karyawan Swasta'),
    (4, 'Guru/Dosen'),
    (5, 'TNI/Polri'),
    (6, 'Dokter/Nakes'),
    (7, 'Petani'),
    (8, 'Buruh'),
    (9, 'Pengacara'),
    (10, 'Konsultan'),
    (11, 'Pelajar/Mahasiswa'),
    (12, 'Tidak Bekerja'),
    (13, 'Lainnya');
  `);
  
  console.log('Profesi table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS profesi;`);
  console.log('Profesi table dropped successfully');
}
