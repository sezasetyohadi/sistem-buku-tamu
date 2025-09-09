import { executeQuery } from '../config/db';

export async function up() {
  console.log('Removing bidang_tujuan system...');
  
  try {
    // Drop foreign key constraint first if it exists
    await executeQuery(`ALTER TABLE daftar_tamu DROP FOREIGN KEY IF EXISTS fk_bidang_tujuan;`);
    console.log('Dropped foreign key constraint fk_bidang_tujuan');
  } catch (error) {
    console.log('Foreign key constraint fk_bidang_tujuan may not exist, continuing...');
  }

  try {
    // Drop index if it exists
    await executeQuery(`ALTER TABLE daftar_tamu DROP INDEX IF EXISTS fk_bidang_tujuan;`);
    console.log('Dropped index fk_bidang_tujuan');
  } catch (error) {
    console.log('Index fk_bidang_tujuan may not exist, continuing...');
  }

  try {
    // Drop the column
    await executeQuery(`ALTER TABLE daftar_tamu DROP COLUMN IF EXISTS bidang_tujuan_id;`);
    console.log('Dropped column bidang_tujuan_id from daftar_tamu table');
  } catch (error) {
    console.log('Column bidang_tujuan_id may not exist, continuing...');
  }

  try {
    // Drop the bidang_tujuan table
    await executeQuery(`DROP TABLE IF EXISTS bidang_tujuan;`);
    console.log('Dropped bidang_tujuan table');
  } catch (error) {
    console.log('Table bidang_tujuan may not exist, continuing...');
  }

  console.log('Bidang_tujuan system removed successfully');
}

export async function down() {
  console.log('Recreating bidang_tujuan system...');
  
  // Recreate bidang_tujuan table
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

  // Add column back to daftar_tamu
  await executeQuery(`ALTER TABLE daftar_tamu ADD COLUMN bidang_tujuan_id int(11) DEFAULT NULL;`);
  
  // Add index
  await executeQuery(`ALTER TABLE daftar_tamu ADD INDEX fk_bidang_tujuan (bidang_tujuan_id);`);
  
  // Add foreign key constraint
  await executeQuery(`
    ALTER TABLE daftar_tamu 
    ADD CONSTRAINT fk_bidang_tujuan 
    FOREIGN KEY (bidang_tujuan_id) REFERENCES bidang_tujuan (id) 
    ON DELETE SET NULL ON UPDATE CASCADE;
  `);
  
  console.log('Bidang_tujuan system recreated successfully');
}
