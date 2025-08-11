import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsBySection } from '@/backend/services/surveyService';

export async function GET(request: NextRequest) {
  try {
    const sections = await getQuestionsBySection();
    
    return NextResponse.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching questions by section:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
