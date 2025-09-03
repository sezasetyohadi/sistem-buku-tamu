import { NextRequest, NextResponse } from 'next/server';
import { testConnection, executeQuery } from '../../../backend/config/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed'
      }, { status: 500 });
    }

    console.log('Database connected, testing survey tables...');

    // Test basic connection
    const basicTest = await executeQuery('SELECT 1 as test');
    console.log('Basic query result:', basicTest);
    
    // Test if pertanyaan_survei table exists and has data
    const questionCount = await executeQuery(`
      SELECT COUNT(*) as count FROM pertanyaan_survei
    `);
    console.log('pertanyaan_survei count:', questionCount);
    
    // Test if jawaban_identitas_survei table exists
    const identityCount = await executeQuery(`
      SELECT COUNT(*) as count FROM jawaban_identitas_survei
    `);
    console.log('jawaban_identitas_survei count:', identityCount);
    
    // Test the exact query used in getAllQuestionsForAdmin
    const questionsTest = await executeQuery(`
      SELECT DISTINCT
        ps.id,
        ps.baris,
        ps.pertanyaan,
        ps.is_aktif,
        ps.created_at
      FROM pertanyaan_survei ps
      WHERE ps.is_aktif = 1
      ORDER BY ps.baris ASC, ps.id ASC
    `);
    console.log('Questions test result:', questionsTest);
      
    return NextResponse.json({
      success: true,
      message: 'Database connection and survey tables test successful',
      data: {
        basicTest,
        questionCount,
        identityCount,
        questionsTest
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: String(error)
    }, { status: 500 });
  }
}
