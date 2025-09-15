import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { SURVEY_QUERIES } from '@/backend/models/surveyModel';
import { getRatingOptions } from '@/backend/services/surveyService';

export const GET = async (request: NextRequest) => {
  try {
    // Get the ratingTypeId from query parameters, default to 1 if not provided
    const searchParams = request.nextUrl.searchParams;
    const ratingTypeId = parseInt(searchParams.get('typeId') || '1');
    const ratingOptions = await getRatingOptions(ratingTypeId);
    return NextResponse.json({
      success: true,
      data: ratingOptions
    });
  } catch (error) {
    console.error('Error fetching rating options:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}; // Closing bracket added here

// POST: Add a new rating option to opsi_rating
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { jenis_rating_id, skala_rating, urutan_rating } = body;
    if (!jenis_rating_id || !skala_rating || !urutan_rating) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    const result = await executeQuery(
      SURVEY_QUERIES.ADD_RATING_OPTION,
      [jenis_rating_id, skala_rating, urutan_rating]
    ) as { insertId: number };
    return NextResponse.json({ success: true, data: { id: result.insertId, jenis_rating_id, skala_rating, urutan_rating } });
  } catch (error) {
    console.error('Error adding rating option:', error);
    return NextResponse.json({ success: false, message: 'Failed to add rating option' }, { status: 500 });
  }
};
