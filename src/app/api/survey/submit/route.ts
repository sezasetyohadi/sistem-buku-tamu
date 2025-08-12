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

    // Convert the answers to the format expected by the service
    const formattedAnswers = body.answers.map((answer: any) => ({
      pertanyaan_id: answer.pertanyaan_id,
      jawaban: answer.rating,
      nama_lengkap: 'Anonymous', // Default since we don't have user info in this context
      email: 'anonymous@example.com', // Default email
      tanggal_kunjungan: new Date().toISOString().split('T')[0], // Today's date
      saran: body.feedback || null
    }));

    // Submit all answers
    await submitSurveyAnswers(formattedAnswers);
    
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
