import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM pertanyaan_s_jenis_rating');
  
  if (count[0].count === 0) {
    // First check if pertanyaan_survei contains data
    const questionCount = await executeQuery<any[]>('SELECT COUNT(*) as count FROM pertanyaan_survei');
    
    if (questionCount[0].count === 0) {
      console.log('No pertanyaan_survei data found, skipping pertanyaan_s_jenis_rating seed');
      return;
    }
    
    // Insert rating associations for each question
    const questions = await executeQuery<any[]>('SELECT id, jenis_rating_id, urutan FROM pertanyaan_survei WHERE jenis_rating_id IS NOT NULL');
    
    for (const question of questions) {
      await executeQuery(`
        INSERT INTO pertanyaan_s_jenis_rating (pertanyaan_id, jenis_rating_id, urutan, is_required)
        VALUES (?, ?, ?, 1)
      `, [
        question.id,
        question.jenis_rating_id,
        question.urutan || 1
      ]);
    }
    
    console.log('Pertanyaan s Jenis Rating seed data inserted successfully');
  } else {
    console.log('Pertanyaan s Jenis Rating data already exists, skipping seed');
  }
}
