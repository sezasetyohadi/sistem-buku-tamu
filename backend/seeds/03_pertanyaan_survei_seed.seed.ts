import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM pertanyaan_survei');
  
  if (count[0].count === 0) {
    // Insert survey questions
    const questions = [
      'Bagaimana penilaian Anda terhadap kemudahan akses layanan?',
      'Bagaimana penilaian Anda terhadap kecepatan pelayanan?',
      'Bagaimana penilaian Anda terhadap keramahan petugas?',
      'Bagaimana penilaian Anda terhadap kualitas hasil layanan?'
    ];
    
    for (const question of questions) {
      await executeQuery(`
        INSERT INTO pertanyaan_survei (pertanyaan, is_aktif)
        VALUES (?, 1)
      `, [question]);
    }
    
    console.log('Pertanyaan Survei seed data inserted successfully');
  } else {
    console.log('Pertanyaan Survei data already exists, skipping seed');
  }
}
