import { executeQuery } from '../config/db';

export async function up() {
  // Add missing fields to jawaban_identitas_survei table
  try {
    await executeQuery(`
      ALTER TABLE jawaban_identitas_survei 
      ADD COLUMN email varchar(100) DEFAULT NULL,
      ADD COLUMN nomor_telp varchar(20) DEFAULT NULL,
      ADD COLUMN tanggal_lahir date DEFAULT NULL,
      ADD COLUMN alamat text DEFAULT NULL,
      ADD COLUMN jenis_layanan_id int(11) DEFAULT NULL,
      ADD KEY fk_jenis_layanan (jenis_layanan_id),
      ADD CONSTRAINT fk_jenis_layanan FOREIGN KEY (jenis_layanan_id) REFERENCES tujuan_kunjungan (id) ON DELETE SET NULL ON UPDATE CASCADE;
    `);
    
    console.log('Jawaban Identitas Survei table updated with new fields successfully');
  } catch (error: any) {
    // Check if columns already exist
    if (error.message.includes('Duplicate column name')) {
      console.log('Columns already exist in jawaban_identitas_survei table');
    } else {
      throw error;
    }
  }
}

export async function down() {
  // Remove the added fields
  await executeQuery(`
    ALTER TABLE jawaban_identitas_survei 
    DROP FOREIGN KEY IF EXISTS fk_jenis_layanan,
    DROP KEY IF EXISTS fk_jenis_layanan,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS nomor_telp,
    DROP COLUMN IF EXISTS tanggal_lahir,
    DROP COLUMN IF EXISTS alamat,
    DROP COLUMN IF EXISTS jenis_layanan_id;
  `);
  
  console.log('Jawaban Identitas Survei table columns removed successfully');
}
