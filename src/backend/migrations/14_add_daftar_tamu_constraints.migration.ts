import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Adding foreign key constraints to daftar_tamu table...');
  
  // Add foreign key constraints to daftar_tamu table
  await executeQuery(`
    ALTER TABLE daftar_tamu
    ADD CONSTRAINT fk_tamu_pendidikan FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_tamu_profesi FOREIGN KEY (profesi_id) REFERENCES profesi (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_tamu_bidang FOREIGN KEY (bidang_tujuan_id) REFERENCES bidang_tujuan (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_tamu_tujuan FOREIGN KEY (tujuan_kunjungan_id) REFERENCES tujuan_kunjungan (id) ON DELETE SET NULL
  `);
  
  console.log('Foreign key constraints added to daftar_tamu table');
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
