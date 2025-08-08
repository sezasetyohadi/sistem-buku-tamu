import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM tujuan_kunjungan');
  
  if (count[0].count === 0) {
    // Insert tujuan_kunjungan data
    const tujuanData = [
      'Konsultasi Layanan',
      'Pengaduan/Keluhan',
      'Pengajuan Permohonan',
      'Mencari Informasi',
      'Meeting/Rapat',
      'Survey/Penelitian'
    ];
    
    for (const tujuan of tujuanData) {
      await executeQuery(`
        INSERT INTO tujuan_kunjungan (tujuan)
        VALUES (?)
      `, [tujuan]);
    }
    
    console.log('Tujuan Kunjungan seed data inserted successfully');
  } else {
    console.log('Tujuan Kunjungan data already exists, skipping seed');
  }
}
