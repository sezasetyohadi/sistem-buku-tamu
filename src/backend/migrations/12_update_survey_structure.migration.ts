import { executeQuery } from '../config/db';

export async function up() {
  console.log('Starting migration: Updating pertanyaan_survei and related tables...');
  
  // Step 1: Add new columns to pertanyaan_survei
  await executeQuery(`
    ALTER TABLE pertanyaan_survei 
    ADD COLUMN IF NOT EXISTS baris INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS kolom INT DEFAULT 1
  `);
  
  console.log('Added baris and kolom fields to pertanyaan_survei table');
  
  // Step 2: Update jenis_rating to add tipe column if it doesn't exist
  await executeQuery(`
    ALTER TABLE jenis_rating 
    ADD COLUMN IF NOT EXISTS tipe ENUM('rating', 'text') NOT NULL DEFAULT 'rating'
  `);
  
  // Step 3: Update data in jenis_rating
  await executeQuery(`UPDATE jenis_rating SET tipe = 'rating' WHERE id IN (1, 2)`);
  await executeQuery(`UPDATE jenis_rating SET tipe = 'text' WHERE id = 3`);
  
  console.log('Updated jenis_rating table with tipe field');
  
  // Step 4: Create pertanyaan_s_jenis_rating table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pertanyaan_s_jenis_rating (
      id INT NOT NULL AUTO_INCREMENT,
      pertanyaan_id INT NOT NULL,
      jenis_rating_id INT NOT NULL,
      urutan INT DEFAULT 1,
      is_required TINYINT(1) DEFAULT 1,
      PRIMARY KEY (id),
      KEY pertanyaan_id (pertanyaan_id),
      KEY jenis_rating_id (jenis_rating_id),
      CONSTRAINT fk_ps_pertanyaan FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei (id) ON DELETE CASCADE,
      CONSTRAINT fk_ps_jenis_rating FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Created pertanyaan_s_jenis_rating table');
  
  // Step 5: Populate pertanyaan_s_jenis_rating with data from pertanyaan_survei (if columns exist)
  try {
    await executeQuery(`
      INSERT INTO pertanyaan_s_jenis_rating (pertanyaan_id, jenis_rating_id, urutan, is_required)
      SELECT id, jenis_rating_id, urutan, 1 FROM pertanyaan_survei 
      WHERE jenis_rating_id IS NOT NULL
      ON DUPLICATE KEY UPDATE jenis_rating_id = VALUES(jenis_rating_id), urutan = VALUES(urutan)
    `);
    console.log('Populated pertanyaan_s_jenis_rating with data from pertanyaan_survei');
  } catch (error: any) {
    console.log('Note: Could not populate pertanyaan_s_jenis_rating - source columns may not exist yet');
  }
  
  // Step 6: Populate baris and kolom fields in pertanyaan_survei
  try {
    await executeQuery(`
      UPDATE pertanyaan_survei 
      SET 
        baris = COALESCE(section_id, 1),
        kolom = COALESCE(urutan, 1)
      WHERE 1=1
    `);
    console.log('Populated baris and kolom fields from section_id and urutan values');
  } catch (error: any) {
    console.log('Note: Could not populate baris/kolom - source columns may not exist yet');
  }
  
  console.log('Migration completed successfully');
}

export async function down() {
  // Carefully dropping added columns to avoid data loss
  try {
    // Drop pertanyaan_s_jenis_rating table
    await executeQuery(`DROP TABLE IF EXISTS pertanyaan_s_jenis_rating;`);
    console.log('Dropped pertanyaan_s_jenis_rating table');
    
    // Remove new columns from pertanyaan_survei
    await executeQuery(`
      ALTER TABLE pertanyaan_survei 
      DROP COLUMN baris,
      DROP COLUMN kolom
    `);
    console.log('Removed baris and kolom fields from pertanyaan_survei table');
    
    // Remove tipe column from jenis_rating
    await executeQuery(`
      ALTER TABLE jenis_rating 
      DROP COLUMN tipe
    `);
    console.log('Removed tipe field from jenis_rating table');
    
  } catch (error) {
    console.error('Error in down migration:', error);
  }
}
