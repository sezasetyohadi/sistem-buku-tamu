import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM section_survei');
  
  if (count[0].count === 0) {
    // Insert section data
    const sections = [
      { nama: 'Penilaian Pelayanan 1', urutan: 1 },
      { nama: 'Penilaian Pelayanan 2', urutan: 2 },
      { nama: 'Rekomendasi', urutan: 3 },
      { nama: 'Kecepatan Pelayanan', urutan: 4 },
      { nama: 'Ketersediaan Informasi', urutan: 5 },
      { nama: 'Saran', urutan: 6 }
    ];
    
    for (const section of sections) {
      await executeQuery(`
        INSERT INTO section_survei (nama_section, urutan)
        VALUES (?, ?)
      `, [section.nama, section.urutan]);
    }
    
    console.log('Section Survei seed data inserted successfully');
  } else {
    console.log('Section Survei data already exists, skipping seed');
  }
}
