import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM pendidikan_terakhir');
  
  if (count[0].count === 0) {
    // Insert pendidikan_terakhir data
    const pendidikanData = [
      'Tidak Sekolah',
      'SD / Sederajat',
      'SMP / Sederajat',
      'SMA / Sederajat',
      'Diploma',
      'Sarjana',
      'Pascasarjana'
    ];
    
    for (const pendidikan of pendidikanData) {
      await executeQuery(`
        INSERT INTO pendidikan_terakhir (pendidikan_terakhir)
        VALUES (?)
      `, [pendidikan]);
    }
    
    console.log('Pendidikan Terakhir seed data inserted successfully');
  } else {
    console.log('Pendidikan Terakhir data already exists, skipping seed');
  }
}
