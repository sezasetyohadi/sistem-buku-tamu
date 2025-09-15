import { NextResponse } from 'next/server';

import { getRatingOptions } from '@/backend/services/surveyService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ratingTypeId = parseInt(id);
    
    if (isNaN(ratingTypeId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid rating type ID' },
        { status: 400 }
      );
    }

    const ratingOptions = await getRatingOptions(ratingTypeId);

    return NextResponse.json({
      success: true,
      data: ratingOptions
    });
  } catch (error: any) {
    console.error('Error fetching rating options:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch rating options',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
