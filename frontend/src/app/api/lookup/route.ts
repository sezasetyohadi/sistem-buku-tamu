import { NextResponse } from 'next/server';
import { getAllEducationLevels, getAllProfessions } from '@/backend/services/guestService';
import { initializeTables } from '@/backend/config/db';

export async function GET() {
  try {
    // Initialize tables if they don't exist
    await initializeTables();
    
    const [educationLevels, professions] = await Promise.all([
      getAllEducationLevels(),
      getAllProfessions()
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        educationLevels,
        professions
      },
      message: 'Lookup data retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting lookup data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve lookup data', error: error.message },
      { status: 500 }
    );
  }
}
