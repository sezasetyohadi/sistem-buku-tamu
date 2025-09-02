import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Adding foreign key constraints to daftar_tamu table...');
  
  // Add foreign key constraints to daftar_tamu table (with existence checks)
  const constraints = [
    { name: 'fk_tamu_pendidikan', sql: 'ALTER TABLE daftar_tamu ADD CONSTRAINT fk_tamu_pendidikan FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir (id) ON DELETE SET NULL' },
    { name: 'fk_tamu_profesi', sql: 'ALTER TABLE daftar_tamu ADD CONSTRAINT fk_tamu_profesi FOREIGN KEY (profesi_id) REFERENCES profesi (id) ON DELETE SET NULL' },
    { name: 'fk_tamu_bidang', sql: 'ALTER TABLE daftar_tamu ADD CONSTRAINT fk_tamu_bidang FOREIGN KEY (bidang_tujuan_id) REFERENCES bidang_tujuan (id) ON DELETE SET NULL' },
    { name: 'fk_tamu_tujuan', sql: 'ALTER TABLE daftar_tamu ADD CONSTRAINT fk_tamu_tujuan FOREIGN KEY (tujuan_kunjungan_id) REFERENCES tujuan_kunjungan (id) ON DELETE SET NULL' }
  ];

  for (const constraint of constraints) {
    try {
      await executeQuery(constraint.sql);
      console.log(`Added constraint: ${constraint.name}`);
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_CANT_CREATE_TABLE') {
        console.log(`Constraint ${constraint.name} already exists, skipping`);
      } else {
        throw error;
      }
    }
  }
  
  console.log('Foreign key constraints processing completed');
}

export async function down() {
  console.log('Starting down migration: Removing foreign key constraints from daftar_tamu table...');
  
  // Remove foreign key constraints from daftar_tamu table
  await executeQuery(`
    ALTER TABLE daftar_tamu
    DROP FOREIGN KEY IF EXISTS fk_tamu_pendidikan,
    DROP FOREIGN KEY IF EXISTS fk_tamu_profesi,
    DROP FOREIGN KEY IF EXISTS fk_tamu_bidang,
    DROP FOREIGN KEY IF EXISTS fk_tamu_tujuan
  `);
  
  console.log('Foreign key constraints removed from daftar_tamu table');
}
