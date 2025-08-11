import { NextRequest, NextResponse } from 'next/server';
import { getRatingOptions } from '@/backend/services/surveyService';

export async function GET(request: NextRequest) {
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
}
