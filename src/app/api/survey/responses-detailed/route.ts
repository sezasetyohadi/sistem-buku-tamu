import { NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';

export async function GET() {
  try {
    console.log('Fetching survey responses with detailed rating info...');
    
    // Get all survey responses with identity information
    const identityQuery = `
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
    
    const responses = await executeQuery<any[]>(identityQuery);
    console.log(`Found ${responses.length} survey responses`);

    // For each respondent, get their detailed survey answers with rating type information
    const responsesWithDetailedAnswers = await Promise.all(
      responses.map(async (response) => {
        try {
          // Get all answers with rating type information
          const detailedAnswersQuery = `
            SELECT 
              js.pertanyaan_id,
              js.jawaban,
              ps.pertanyaan,
              psjr.jenis_rating_id,
              psjr.urutan,
              jr.nama_rating as jenis_rating_nama
            FROM jawaban_survei js
            JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
            LEFT JOIN pertanyaan_s_jenis_rating psjr ON ps.id = psjr.pertanyaan_id
            LEFT JOIN jenis_rating jr ON psjr.jenis_rating_id = jr.id
            WHERE js.responden_id = ?
            ORDER BY ps.baris, ps.id, psjr.urutan
          `;
          
          const detailedAnswers = await executeQuery<any[]>(detailedAnswersQuery, [
            response.id
          ]);

          // Process answers - keep original display format but add rating metadata
          const responsesObj: { [key: string]: number | string } = {};
          const ratingMetadata: { [key: string]: { kinerja?: number, kepentingan?: number } } = {};
          
          detailedAnswers.forEach(answer => {
            // For display purposes, group multiple ratings of same question
            if (!responsesObj[answer.pertanyaan]) {
              responsesObj[answer.pertanyaan] = answer.jawaban;
              ratingMetadata[answer.pertanyaan] = {};
            }
            
            // Store rating metadata separately
            if (answer.jenis_rating_id === 4) { // Kinerja
              ratingMetadata[answer.pertanyaan].kinerja = answer.jawaban;
            } else if (answer.jenis_rating_id === 5) { // Kepentingan
              ratingMetadata[answer.pertanyaan].kepentingan = answer.jawaban;
            }
          });

          return {
            ...response,
            responses: responsesObj,
            rating_metadata: ratingMetadata
          };
        } catch (answerError) {
          console.error(`Error fetching answers for response ${response.id}:`, answerError);
          return {
            ...response,
            responses: {},
            rating_metadata: {}
          };
        }
      })
    );

    console.log('Successfully processed all responses with detailed rating info');
    return NextResponse.json({
      success: true,
      data: responsesWithDetailedAnswers
    });

  } catch (error: any) {
    console.error('Error fetching detailed survey responses:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch detailed survey responses',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
