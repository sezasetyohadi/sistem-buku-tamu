import { NextRequest, NextResponse } from 'next/server';
import { submitSurvey, getAllSurveyResponses } from '@/backend/services/guestService';
import { SurveyFormData } from '@/types/database-types';

export async function GET() {
  try {
    const surveys = await getAllSurveyResponses();
    return NextResponse.json({ 
      success: true, 
      data: surveys,
      message: 'Survey responses retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting surveys:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve surveys', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SurveyFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.overallRating) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and overall rating are required' },
        { status: 400 }
      );
    }

    const success = await submitSurvey(body);
    
    if (success) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Survey submitted successfully'
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to submit survey' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
