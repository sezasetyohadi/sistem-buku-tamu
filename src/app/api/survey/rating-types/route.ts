// POST: Add a new rating type and its options
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { nama_rating, tipe, options } = body;
    if (!nama_rating || !tipe || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    // Insert the new rating type
    const result = await executeQuery(
      "INSERT INTO jenis_rating (tipe, nama_rating) VALUES (?, ?)",
      [tipe, nama_rating]
    ) as { insertId: number };
    const jenis_rating_id = result.insertId;
    // Insert each option
    for (let i = 0; i < options.length; i++) {
      const skala_rating = options[i];
      await executeQuery(
        "INSERT INTO opsi_rating (jenis_rating_id, skala_rating, urutan_rating) VALUES (?, ?, ?)",
        [jenis_rating_id, skala_rating, i + 1]
      );
    }
    return NextResponse.json({ success: true, data: { id: jenis_rating_id, nama_rating, tipe } });
  } catch (error) {
    console.error('Error adding rating type:', error);
    return NextResponse.json({ success: false, message: 'Failed to add rating type' }, { status: 500 });
  }
};
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import { getRatingTypes } from '@/backend/services/surveyService';

// GET: Retrieve rating types with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Get the type parameter from the URL if present
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'rating' | 'text' | null;
    
    // Use the existing service function to get rating types with optional filtering
    const ratingTypes = await getRatingTypes(type || undefined);
    
    return NextResponse.json({
      success: true,
      message: 'Rating types retrieved successfully',
      data: ratingTypes
    });
  } catch (error) {
    console.error('Error getting rating types:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve rating types',
      error: (error as Error).message
    }, { status: 500 });
  }
}
