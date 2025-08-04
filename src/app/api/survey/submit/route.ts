import { NextRequest, NextResponse } from 'next/server';
import { submitSurveyAnswers } from '@/backend/services/surveyService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate that answers exist and are an array
    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid survey answers format' },
        { status: 400 }
      );
    }

    // Submit all answers
    await submitSurveyAnswers(body.answers);
    
    return NextResponse.json({
      success: true,
      message: 'Survey answers submitted successfully'
    });
  } catch (error: any) {
    console.error('Error submitting survey answers:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
