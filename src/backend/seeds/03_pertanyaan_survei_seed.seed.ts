import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM pertanyaan_survei');
  
  if (count[0].count === 0) {
    // Insert survey questions based on sections
    const questions = [
      // Section 1 - Penilaian Pelayanan 1
      { section_id: 1, urutan: 1, pertanyaan: 'Keramahan Petugas', tipe_jawaban: 'rating' },
      { section_id: 1, urutan: 2, pertanyaan: 'Kecepatan Pelayanan', tipe_jawaban: 'rating' },
      
      // Section 2 - Penilaian Pelayanan 2
      { section_id: 2, urutan: 1, pertanyaan: 'Ketepatan Pelayanan', tipe_jawaban: 'rating' },
      { section_id: 2, urutan: 2, pertanyaan: 'Kepuasan Pelayanan', tipe_jawaban: 'rating' },
      
      // Section 3 - Rekomendasi
      { section_id: 3, urutan: 1, pertanyaan: 'Apakah Anda akan merekomendasikan pelayanan DISNAKERTRANS Jateng?', tipe_jawaban: 'teks' },
      
      // Section 4 - Kecepatan Pelayanan
      { section_id: 4, urutan: 1, pertanyaan: 'Berapa waktu yang Anda habiskan untuk mendapat layanan di DISNAKERTRANS Jateng?', tipe_jawaban: 'teks' },
      
      // Section 5 - Ketersediaan Informasi (Skala 3)
      { section_id: 5, urutan: 1, pertanyaan: 'Ketersediaan informasi secara online', tipe_jawaban: 'rating' },
      { section_id: 5, urutan: 2, pertanyaan: 'Ketersediaan informasi di kantor', tipe_jawaban: 'rating' },
      
      // Section 6 - Saran
      { section_id: 6, urutan: 1, pertanyaan: 'Saran Perbaikan', tipe_jawaban: 'teks' }
    ];
    
    for (const question of questions) {
      await executeQuery(`
        INSERT INTO pertanyaan_survei (section_id, urutan, pertanyaan, tipe_jawaban, is_aktif)
        VALUES (?, ?, ?, ?, 1)
      `, [question.section_id, question.urutan, question.pertanyaan, question.tipe_jawaban]);
    }
    
    console.log('Pertanyaan Survei seed data inserted successfully');
  } else {
    console.log('Pertanyaan Survei data already exists, skipping seed');
  }
}
