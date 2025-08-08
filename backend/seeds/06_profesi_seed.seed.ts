import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM profesi');
  
  if (count[0].count === 0) {
    // Insert profesi data
    const profesiData = [
      'Pelajar/Mahasiswa',
      'PNS',
      'Wiraswasta',
      'Karyawan Swasta',
      'Guru/Dosen',
      'TNI/Polri',
      'Dokter/Nakes',
      'Tidak Bekerja'
    ];
    
    for (const profesi of profesiData) {
      await executeQuery(`
        INSERT INTO profesi (nama_profesi)
        VALUES (?)
      `, [profesi]);
    }
    
    console.log('Profesi seed data inserted successfully');
  } else {
    console.log('Profesi data already exists, skipping seed');
  }
}
