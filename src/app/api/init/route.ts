import { NextRequest, NextResponse } from 'next/server';
import { initGuestTable } from '@/backend/services/guestService';
import { initSurveyTables } from '@/backend/services/surveyService';
import { executeQuery } from '@/backend/config/db';
import { SURVEY_QUERIES } from '@/backend/models/surveyModel';

export async function GET(request: NextRequest) {
  try {
    // Initialize guest table
    await initGuestTable();
    
    // Initialize survey tables
    await initSurveyTables();
    
    // Insert default questions if not exist
    await executeQuery(SURVEY_QUERIES.INSERT_DEFAULT_QUESTIONS);
    
    // Check if there are any questions
    const questionsResult = await executeQuery<any[]>('SELECT id FROM pertanyaan_survei');
    
    // If we have questions but no options, insert default options
    if (questionsResult.length > 0) {
      const optionsResult = await executeQuery<any[]>('SELECT COUNT(*) as count FROM opsi_jawaban');
      if (optionsResult[0].count === 0) {
        await executeQuery(SURVEY_QUERIES.INSERT_DEFAULT_OPTIONS);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
