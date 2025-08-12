import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion
} from '@/backend/services/surveyService';
import { SurveyQuestion } from '@/backend/models/surveyModel';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active survey questions with their options
    const questions = await getAllQuestions();
    
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
    const { pertanyaan, tipe_pertanyaan, urutan } = body;
    
    // Default section_id = 1 if not provided
    const sectionId = 1;
    
    const questionId = await addQuestion(sectionId, urutan, pertanyaan, tipe_pertanyaan);
    
    return NextResponse.json({
      success: true,
      data: { id: questionId },
      message: 'Question added successfully'
    });
  } catch (error: any) {
    console.error('Error adding survey question:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
