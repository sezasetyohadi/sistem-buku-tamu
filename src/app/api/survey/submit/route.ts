import { NextRequest, NextResponse } from 'next/server';
import { submitSurveyWithIdentity } from '@/backend/services/surveyService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate that identity and answers exist
    if (!body.identity) {
      return NextResponse.json(
        { success: false, message: 'Identity data is required' },
        { status: 400 }
      );
    }

    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Survey answers are required' },
        { status: 400 }
      );
    }

    // Submit identity and answers
    await submitSurveyWithIdentity(body.identity, body.answers, body.feedback);
    
    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully'
    });
  } catch (error: any) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
