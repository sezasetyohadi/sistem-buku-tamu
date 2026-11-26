import { NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const respondenId = parseInt(id);
    
    if (isNaN(respondenId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid responden ID' },
        { status: 400 }
      );
    }

    // Get detailed answers from jawaban_survei table
    const query = `
      SELECT 
        js.id,
        js.responden_id,
        js.pertanyaan_id,
        js.jawaban,
        js.created_at,
        ps.pertanyaan,
        pjr.jenis_rating_id
      FROM jawaban_survei js
      JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
      LEFT JOIN opsi_rating o ON js.jawaban = o.id
      LEFT JOIN pertanyaan_s_jenis_rating pjr
        ON ps.id = pjr.pertanyaan_id
        AND o.jenis_rating_id = pjr.jenis_rating_id
      WHERE js.responden_id = ?
      ORDER BY ps.baris, pjr.urutan, js.id
    `;
    
    const answers = await executeQuery<any[]>(query, [respondenId]);

    return NextResponse.json({
      success: true,
      data: answers
    });
  } catch (error: any) {
    console.error('Error fetching detailed survey answers:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch detailed survey answers',
        error: error.message 
      },
      { status: 500 }
    );
  }
}