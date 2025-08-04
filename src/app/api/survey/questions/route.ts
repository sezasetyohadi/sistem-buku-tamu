import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllSurveyQuestions,
  getSurveyQuestionWithOptions,
  SurveyQuestion
} from '@/backend/services/surveyService';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active survey questions with their options
    const questions = await getAllSurveyQuestions();
    
    // For each question, fetch its options
    const questionsWithOptions = await Promise.all(questions.map(async (question: SurveyQuestion) => {
      const withOptions = await getSurveyQuestionWithOptions(question.id);
      return withOptions;
    }));
    
    return NextResponse.json({
      success: true,
      data: questionsWithOptions
    });
  } catch (error: any) {
    console.error('Error fetching survey questions:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
