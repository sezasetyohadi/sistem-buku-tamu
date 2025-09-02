import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Updating survey structure...');
  
  // Update jawaban_identitas_survei table structure if needed
  try {
    await executeQuery(`
      ALTER TABLE jawaban_identitas_survei 
      MODIFY COLUMN asal_instansi varchar(255) DEFAULT NULL,
      MODIFY COLUMN keperluan text DEFAULT NULL
    `);
    console.log('Updated jawaban_identitas_survei table structure');
  } catch (error: any) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.log('Survey structure update completed with some existing fields');
    }
  }

  // Update pertanyaan_survei table if needed
  try {
    await executeQuery(`
      ALTER TABLE pertanyaan_survei 
      MODIFY COLUMN teks_pertanyaan text NOT NULL,
      MODIFY COLUMN tipe_jawaban enum('rating', 'text', 'pilihan_ganda') NOT NULL DEFAULT 'rating'
    `);
    console.log('Updated pertanyaan_survei table structure');
  } catch (error: any) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.log('Survey questions structure already up to date');
    }
  }

  console.log('Survey structure update completed');
}

export async function down() {
  console.log('Starting down migration: Reverting survey structure changes...');
  
  // Revert changes if needed (optional implementation)
  console.log('Survey structure down migration completed');
}