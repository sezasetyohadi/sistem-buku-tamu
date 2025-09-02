import { NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';

export async function GET() {
  try {
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
    
    const responses = await executeQuery<any[]>(query);

    // For each respondent, get their survey answers
    const responsesWithAnswers = await Promise.all(
      responses.map(async (response) => {
        // Get survey answers for this respondent based on responden_id
        const answersQuery = `
          SELECT 
            js.pertanyaan_id,
            js.jawaban,
            ps.pertanyaan
          FROM jawaban_survei js
          JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
          WHERE js.responden_id = ?
          ORDER BY ps.baris, ps.id
        `;
        
        const answers = await executeQuery<any[]>(answersQuery, [
          response.id
        ]);

        // Convert answers to object format for easier display
        const responsesObj: { [key: string]: number | string } = {};
        answers.forEach(answer => {
          responsesObj[answer.pertanyaan] = answer.jawaban;
        });

        return {
          ...response,
          responses: responsesObj
        };
      })
    );

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
