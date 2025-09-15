import { NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';

export async function GET() {
  try {
    console.log('Starting to fetch survey responses...');
    
    // Query to get survey responses with identity information
    // Based on the actual disnaker.sql structure (latest version)
    const query = `
      SELECT 
        jis.id,
        jis.nama_lengkap,
        jis.email,
        jis.nomor_telepon,
        jis.tanggal_lahir,
        jis.jenis_kelamin,
        jis.alamat,
        jis.created_at,
        DATE_FORMAT(jis.created_at, '%Y-%m-%d') as tanggal,
        DATE_FORMAT(jis.created_at, '%H:%i') as waktu,
        pt.pendidikan_terakhir,
        p.nama_profesi,
        tk.tujuan as jenis_layanan,
        jis.saran
      FROM jawaban_identitas_survei jis
      LEFT JOIN pendidikan_terakhir pt ON jis.pendidikan_terakhir_id = pt.id
      LEFT JOIN profesi p ON jis.pekerjaan_utama_id = p.id
      LEFT JOIN tujuan_kunjungan tk ON jis.jenis_layanan_id = tk.id
      ORDER BY jis.created_at DESC
    `;
    
    console.log('Executing main query...');
    const responses = await executeQuery<any[]>(query);
    console.log(`Found ${responses.length} survey responses`);

    // For each respondent, get their survey answers
    const responsesWithAnswers = await Promise.all(
      responses.map(async (response) => {
        try {
          // Get survey answers for this respondent based on responden_id
          // Need to join with opsi_rating to get the actual scale values instead of option IDs
          const answersQuery = `
            SELECT 
              js.pertanyaan_id,
              js.jawaban,
              ps.pertanyaan,
              pjr.jenis_rating_id,
              pjr.urutan,
              or_table.urutan_rating as scale_value
            FROM jawaban_survei js
            JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
            JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
            LEFT JOIN opsi_rating or_table ON js.jawaban = or_table.id
            WHERE js.responden_id = ?
            ORDER BY ps.baris, ps.id, pjr.urutan
          `;
          
          const answers = await executeQuery<any[]>(answersQuery, [
            response.id
          ]);

          // Convert answers to object format for display (original format)
          const responsesObj: { [key: string]: number | string } = {};
          // Also collect separated rating data for filtering using scale values
          const kinerjaRatings: { [key: string]: number } = {};
          const kepentinganRatings: { [key: string]: number } = {};
          
          // Group answers by question
          const answersByQuestion = new Map();
          answers.forEach(answer => {
            if (!answersByQuestion.has(answer.pertanyaan)) {
              answersByQuestion.set(answer.pertanyaan, []);
            }
            answersByQuestion.get(answer.pertanyaan).push(answer);
          });

          // Process each question's answers
          answersByQuestion.forEach((questionAnswers, pertanyaan) => {
            // Sort by urutan to ensure correct order
            questionAnswers.sort((a: any, b: any) => a.urutan - b.urutan);
            
            // For display purposes, use the first answer (maintaining existing display)
            if (questionAnswers.length > 0) {
              responsesObj[pertanyaan] = questionAnswers[0].jawaban;
            }
            
            // Extract separated ratings for filtering using scale values
            questionAnswers.forEach((answer: any) => {
              if (answer.jenis_rating_id === 4) { // Kinerja
                kinerjaRatings[pertanyaan] = answer.scale_value || answer.jawaban;
              } else if (answer.jenis_rating_id === 5) { // Kepentingan
                kepentinganRatings[pertanyaan] = answer.scale_value || answer.jawaban;
              }
            });
          });

          console.log(`Response ${response.id} - Kinerja ratings:`, kinerjaRatings);
          console.log(`Response ${response.id} - Kepentingan ratings:`, kepentinganRatings);

          return {
            ...response,
            responses: responsesObj,
            kinerja_ratings: kinerjaRatings,
            kepentingan_ratings: kepentinganRatings
          };
        } catch (answerError) {
          console.error(`Error fetching answers for response ${response.id}:`, answerError);
          return {
            ...response,
            responses: {}
          };
        }
      })
    );

    console.log('Successfully processed all responses');
    return NextResponse.json({
      success: true,
      data: responsesWithAnswers
    });
  } catch (error: any) {
    console.error('Error fetching survey responses:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch survey responses',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
