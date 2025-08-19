import { executeQuery } from '../config/db';

/**
 * Migration to create memperoleh_informasi and mendapatkan_salinan tables
 * Based on disnaker.sql schema
 */
export const up = async (): Promise<void> => {
  console.log('Running migration: Creating memperoleh_informasi and mendapatkan_salinan tables...');

  try {
    // Create memperoleh_informasi table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS memperoleh_informasi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_opsi VARCHAR(255) NOT NULL
      );
    `);

    // Create mendapatkan_salinan table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS mendapatkan_salinan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_opsi VARCHAR(255) NOT NULL
      );
    `);
    
    // Create jawaban_memperoleh_informasi table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS jawaban_memperoleh_informasi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tamu_id INT NOT NULL,
        cara_memperoleh_id INT NOT NULL,
        FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE,
        FOREIGN KEY (cara_memperoleh_id) REFERENCES memperoleh_informasi (id) ON DELETE CASCADE
      );
    `);
    
    // Create jawaban_mendapatkan_salinan table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS jawaban_mendapatkan_salinan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tamu_id INT NOT NULL,
        cara_salinan_id INT NOT NULL,
        FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE,
        FOREIGN KEY (cara_salinan_id) REFERENCES mendapatkan_salinan (id) ON DELETE CASCADE
      );
    `);
    
    console.log('Migration completed: memperoleh_informasi and mendapatkan_salinan tables created!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Down migration to rollback changes
 */
export const down = async (): Promise<void> => {
  console.log('Rolling back migration: Dropping memperoleh_informasi and mendapatkan_salinan tables...');

  try {
    // Drop tables in reverse order to avoid foreign key constraint issues
    await executeQuery('DROP TABLE IF EXISTS jawaban_mendapatkan_salinan;');
    await executeQuery('DROP TABLE IF EXISTS jawaban_memperoleh_informasi;');
    await executeQuery('DROP TABLE IF EXISTS mendapatkan_salinan;');
    await executeQuery('DROP TABLE IF EXISTS memperoleh_informasi;');
    
    console.log('Rollback completed: Tables dropped!');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};

export default { up, down };
