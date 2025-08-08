import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM bidang_tujuan');
  
  if (count[0].count === 0) {
    // Insert bidang tujuan data
    const bidangData = [
      'Sekretariat',
      'Bidang Pelatihan Kerja',
      'Bidang Penempatan Tenaga Kerja',
      'Bidang Hubungan Industrial',
      'Bidang Norma Kerja',
      'Bidang Transmigrasi',
      'Kepala Dinas'
    ];
    
    for (const bidang of bidangData) {
      await executeQuery(`
        INSERT INTO bidang_tujuan (bidang)
        VALUES (?)
      `, [bidang]);
    }
    
    console.log('Bidang Tujuan seed data inserted successfully');
  } else {
    console.log('Bidang Tujuan data already exists, skipping seed');
  }
}
