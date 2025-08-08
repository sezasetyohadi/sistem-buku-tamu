import { NextResponse } from 'next/server';
import { getGuestStatistics, getSurveyStatistics } from '@/backend/services/guestService';

export async function GET() {
  try {
    const [guestStats, surveyStats] = await Promise.all([
      getGuestStatistics(),
      getSurveyStatistics()
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        guests: guestStats,
        surveys: surveyStats
      },
      message: 'Statistics retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve statistics', error: error.message },
      { status: 500 }
    );
  }
}
