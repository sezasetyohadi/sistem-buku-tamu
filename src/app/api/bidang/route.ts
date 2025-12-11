import { NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { createApiResponse } from '@/lib/api-response';

// GET - Retrieve all bidang
export async function GET() {
  const response = createApiResponse();
  
  try {
    const bidang = await executeQuery(
      'SELECT id, bidang FROM bidang_tujuan WHERE id != 999 ORDER BY id ASC'
    );

    return response.success(bidang, 'Bidang berhasil diambil');
  } catch (error) {
    console.error('Error fetching bidang:', error);
    return response.error('Gagal mengambil data bidang', 500);
  }
}
