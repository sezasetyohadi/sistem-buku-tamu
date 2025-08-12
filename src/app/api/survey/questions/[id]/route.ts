import { NextRequest, NextResponse } from 'next/server';
import { 
  updateQuestion,
  deleteQuestion,
  getQuestionById
} from '@/backend/services/surveyService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);
    const body = await request.json();
    const { pertanyaan, tipe_pertanyaan, urutan, status } = body;
    
    // Default section_id = 1 if not provided
    const sectionId = 1;
    
    await updateQuestion(questionId, sectionId, urutan, pertanyaan, tipe_pertanyaan, status);
    
    return NextResponse.json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating survey question:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);
    
    await deleteQuestion(questionId);
    
    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting survey question:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);
    
    const question = await getQuestionById(questionId);
    
    return NextResponse.json({
      success: true,
      data: question
    });
  } catch (error: any) {
    console.error('Error fetching survey question:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
