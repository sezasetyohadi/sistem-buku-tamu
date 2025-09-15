import { NextRequest, NextResponse } from 'next/server';

import { SurveyQuestion } from '@/backend/models/surveyModel';
import { 
  getAllQuestions,
  getAllQuestionsForAdmin,
  getActiveQuestions,
  getActiveQuestionsForGuests,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion
} from '@/backend/services/surveyService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forGuest = searchParams.get('for_guest') === 'true';
    
    // Fetch questions based on context
    let questions;
    if (forGuest) {
      // Use special function for guests that groups multiple rating types
      questions = await getActiveQuestionsForGuests();
    } else {
      // For admin, use the new function that prevents duplication
      questions = await getAllQuestionsForAdmin();
    }
    
    return NextResponse.json({
      success: true,
      data: questions
    });
  } catch (error: any) {
    console.error('Error fetching survey questions:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      pertanyaan, 
      tipe_pertanyaan, 
      jenis_rating_id, 
      status = true,
      is_required = true,
      multiple_rating_types
    } = body;
    
    console.log('API received is_required:', is_required, typeof is_required);
    
    // Add question with multiple rating types support
    const questionId = await addQuestion(
      pertanyaan, 
      tipe_pertanyaan,
      jenis_rating_id,
      is_required,
      multiple_rating_types
    );
    
    return NextResponse.json({
      success: true,
      data: { id: questionId },
      message: 'Question added successfully'
    });
  } catch (error: any) {
    console.error('Error adding survey question:', error);
    return NextResponse.json(
      { success: false, message: `Error adding question: ${error.message}` },
      { status: 500 }
    );
  }
}
