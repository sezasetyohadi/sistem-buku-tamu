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
    // Ensure params is properly resolved before accessing properties
    const { id } = params;
    const questionId = parseInt(id);
    const body = await request.json();
    const { 
      pertanyaan, 
      tipe_pertanyaan, 
      is_aktif, // <-- tambahkan ini
      baris, 
      kolom, 
      jenis_rating_id,
      is_required = true
    } = body;
    
    // Update the question with all new parameters
    await updateQuestion(
      questionId, 
      baris || 1, 
      kolom || 1, 
      pertanyaan, 
      tipe_pertanyaan, 
      is_aktif, // <-- gunakan ini, bukan status
      jenis_rating_id,
      is_required
    );
    
    return NextResponse.json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating survey question:', error);
    return NextResponse.json(
      { success: false, message: `Error updating question: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly resolved before accessing properties
    const { id } = params;
    const questionId = parseInt(id);
    
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
    // Ensure params is properly resolved before accessing properties
    const { id } = params;
    const questionId = parseInt(id);
    
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
