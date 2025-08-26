import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllQuestions,
  getActiveQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion
} from '@/backend/services/surveyService';
import { SurveyQuestion } from '@/backend/models/surveyModel';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forGuest = searchParams.get('for_guest') === 'true';
    
    // Fetch questions based on context
    const questions = forGuest ? await getActiveQuestions() : await getAllQuestions();
    
    // For each question, fetch its options
    const questionsWithOptions = await Promise.all(questions.map(async (question: SurveyQuestion) => {
      const withOptions = await getQuestionById(question.id);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      pertanyaan, 
      tipe_pertanyaan, 
      jenis_rating_id, 
      status = true,
      is_required = true
    } = body;
    
    // Add question with new parameters
    const questionId = await addQuestion(
      pertanyaan, 
      tipe_pertanyaan,
      jenis_rating_id,
      is_required
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
