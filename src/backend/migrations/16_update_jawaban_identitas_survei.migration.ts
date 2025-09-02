import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Updating jawaban_identitas_survei table...');
  
  // Add columns one by one to handle existing columns gracefully
  const columns = [
    { name: 'email', sql: 'ALTER TABLE jawaban_identitas_survei ADD COLUMN email varchar(100) DEFAULT NULL' },
    { name: 'nomor_telp', sql: 'ALTER TABLE jawaban_identitas_survei ADD COLUMN nomor_telp varchar(20) DEFAULT NULL' },
    { name: 'tanggal_lahir', sql: 'ALTER TABLE jawaban_identitas_survei ADD COLUMN tanggal_lahir date DEFAULT NULL' },
    { name: 'alamat', sql: 'ALTER TABLE jawaban_identitas_survei ADD COLUMN alamat text DEFAULT NULL' },
    { name: 'jenis_layanan_id', sql: 'ALTER TABLE jawaban_identitas_survei ADD COLUMN jenis_layanan_id int(11) DEFAULT NULL' }
  ];

  for (const column of columns) {
    try {
      await executeQuery(column.sql);
      console.log(`Added column: ${column.name}`);
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log(`Column ${column.name} already exists, skipping`);
      } else {
        throw error;
      }
    }
  }

  // Add index and foreign key constraint separately
  try {
    await executeQuery('ALTER TABLE jawaban_identitas_survei ADD KEY fk_jenis_layanan (jenis_layanan_id)');
    console.log('Added index for jenis_layanan_id');
  } catch (error: any) {
    if (error.code === 'ER_DUP_KEYNAME') {
      console.log('Index fk_jenis_layanan already exists, skipping');
    } else {
      throw error;
    }
  }

  try {
    await executeQuery('ALTER TABLE jawaban_identitas_survei ADD CONSTRAINT fk_jenis_layanan FOREIGN KEY (jenis_layanan_id) REFERENCES tujuan_kunjungan (id) ON DELETE SET NULL ON UPDATE CASCADE');
    console.log('Added foreign key constraint for jenis_layanan_id');
  } catch (error: any) {
    if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_CANT_CREATE_TABLE') {
      console.log('Foreign key constraint fk_jenis_layanan already exists, skipping');
    } else {
      throw error;
    }
  }

  console.log('Jawaban identitas survei table update completed');
}

export async function down() {
  console.log('Starting down migration: Removing additional columns from jawaban_identitas_survei...');
  
  // Remove foreign key constraint first
  await executeQuery(`ALTER TABLE jawaban_identitas_survei DROP FOREIGN KEY IF EXISTS fk_jenis_layanan;`);
  
  // Remove additional columns
  await executeQuery(`
    ALTER TABLE jawaban_identitas_survei 
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS nomor_telp,
    DROP COLUMN IF EXISTS tanggal_lahir,
    DROP COLUMN IF EXISTS alamat,
    DROP COLUMN IF EXISTS jenis_layanan_id;
  `);
  
  console.log('Additional columns removed from jawaban_identitas_survei table');
}
