import { executeQuery } from '../config/db';

/**
 * Migration to create memperoleh_informasi and mendapatkan_salinan tables
 * Based on disnaker.sql schema
 */
export async function up(): Promise<void> {
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

    console.log('memperoleh_informasi and mendapatkan_salinan tables created successfully');
  } catch (error) {
    console.error('Error creating memperoleh_informasi and mendapatkan_salinan tables:', error);
    throw error;
  }
}

export async function down(): Promise<void> {
  console.log('Running down migration: Dropping memperoleh_informasi and mendapatkan_salinan tables...');

  try {
    await executeQuery(`DROP TABLE IF EXISTS mendapatkan_salinan;`);
    await executeQuery(`DROP TABLE IF EXISTS memperoleh_informasi;`);
    console.log('memperoleh_informasi and mendapatkan_salinan tables dropped successfully');
  } catch (error) {
    console.error('Error dropping memperoleh_informasi and mendapatkan_salinan tables:', error);
    throw error;
  }
}
