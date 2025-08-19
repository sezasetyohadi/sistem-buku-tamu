import { executeQuery } from '../config/db';

/**
 * Seed data for memperoleh_informasi table
 * Based on disnaker.sql values
 */
export const seed = async (): Promise<void> => {
  console.log('Running seed: Populating memperoleh_informasi table...');

  try {
    // First check if table exists
    const tableCheck = await executeQuery<Array<{count: number}>>(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'memperoleh_informasi'
    `);
    
    if (tableCheck[0].count === 0) {
      console.log('Table memperoleh_informasi does not exist, skipping seed');
      return;
    }

    // Check if there's any existing data
    const dataCheck = await executeQuery<Array<{count: number}>>('SELECT COUNT(*) as count FROM memperoleh_informasi');
    
    if (dataCheck[0].count > 0) {
      console.log('memperoleh_informasi table already has data, skipping seed');
      return;
    }

    // Insert seed data based on the disnaker.sql values
    const values = [
      ['Melihat/membaca/mendengarkan/mencatat'],
      ['Mendapatkan salinan informasi']
    ];

    for (const [nama_opsi] of values) {
      await executeQuery('INSERT INTO memperoleh_informasi (nama_opsi) VALUES (?)', [nama_opsi]);
    }

    console.log('Seed completed: memperoleh_informasi table populated!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
};

export default { seed };
