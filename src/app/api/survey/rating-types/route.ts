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
