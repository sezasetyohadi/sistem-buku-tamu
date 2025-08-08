import { NextResponse } from 'next/server';
import { getAllSurveyQuestions, getSurveyOptions } from '@/backend/services/guestService';

export async function GET() {
  try {
    const questions = await getAllSurveyQuestions();
    
    // Get options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await getSurveyOptions(question.id!);
        return {
          ...question,
          options
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: questionsWithOptions,
      message: 'Survey questions retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting survey questions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve survey questions', error: error.message },
      { status: 500 }
    );
  }
}
