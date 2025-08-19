import { executeQuery } from '../config/db';

/**
 * Seed data for mendapatkan_salinan table
 * Based on disnaker.sql values
 */
export const seed = async (): Promise<void> => {
  console.log('Running seed: Populating mendapatkan_salinan table...');

  try {
    // First check if table exists
    const tableCheck = await executeQuery<Array<{count: number}>>(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'mendapatkan_salinan'
    `);
    
    if (tableCheck[0].count === 0) {
      console.log('Table mendapatkan_salinan does not exist, skipping seed');
      return;
    }

    // Check if there's any existing data
    const dataCheck = await executeQuery<Array<{count: number}>>('SELECT COUNT(*) as count FROM mendapatkan_salinan');
    
    if (dataCheck[0].count > 0) {
      console.log('mendapatkan_salinan table already has data, skipping seed');
      return;
    }

    // Insert seed data based on the disnaker.sql values
    const values = [
      ['Mengambil langsung'],
      ['Kurir'],
      ['Pos'],
      ['Faksimili'],
      ['E-mail']
    ];

    for (const [nama_opsi] of values) {
      await executeQuery('INSERT INTO mendapatkan_salinan (nama_opsi) VALUES (?)', [nama_opsi]);
    }

    console.log('Seed completed: mendapatkan_salinan table populated!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
};

export default { seed };
