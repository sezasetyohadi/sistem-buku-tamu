import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM pertanyaan_survei');
  
  if (count[0].count === 0) {
    // Insert survey questions based on sections
    const questions = [
      // Section 1
      { section_id: 1, urutan: 1, pertanyaan: 'Rating Keseluruhan', jenis_rating_id: 1 },
      { section_id: 1, urutan: 2, pertanyaan: 'Rating Pelayanan Staff', jenis_rating_id: 1 },
      
      // Section 2
      { section_id: 2, urutan: 1, pertanyaan: 'Rating Fasilitas', jenis_rating_id: 1 },
      { section_id: 2, urutan: 2, pertanyaan: 'Rating Kecepatan Layanan', jenis_rating_id: 1 },
      
      // Section 3
      { section_id: 3, urutan: 1, pertanyaan: 'Apakah Anda akan merekomendasikan pelayanan DISNAKERTRANS Jateng?', jenis_rating_id: 2 },
      
      // Section 4
      { section_id: 4, urutan: 1, pertanyaan: 'Bagaimana penilaian Anda terhadap kecepatan pelayanan?', jenis_rating_id: 2 },
      
      // Section 5
      { section_id: 5, urutan: 1, pertanyaan: 'Saran Perbaikan', jenis_rating_id: 3 }
    ];
    
    for (const question of questions) {
      await executeQuery(`
        INSERT INTO pertanyaan_survei (section_id, urutan, pertanyaan, jenis_rating_id, is_aktif)
        VALUES (?, ?, ?, ?, 1)
      `, [question.section_id, question.urutan, question.pertanyaan, question.jenis_rating_id]);
    }
    
    console.log('Pertanyaan Survei seed data inserted successfully');
  } else {
    console.log('Pertanyaan Survei data already exists, skipping seed');
  }
}
