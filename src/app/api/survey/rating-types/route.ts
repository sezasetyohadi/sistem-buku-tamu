import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import { getRatingTypes } from '@/backend/services/surveyService';

// GET: Retrieve all rating types
export async function GET(request: NextRequest) {
  try {
    // Use the existing service function to get rating types
    const ratingTypes = await getRatingTypes();
    
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
