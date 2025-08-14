import { NextResponse } from 'next/server';
import { getGuestStatistics, getSurveyStatistics, getRecentActivities } from '@/backend/services/guestService';

export async function GET() {
  try {
    const [guestStats, surveyStats, recentActivities] = await Promise.all([
      getGuestStatistics(),
      getSurveyStatistics(),
      getRecentActivities(5) // Get 5 most recent activities
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        // For compatibility with both admin and guest dashboards
        totalGuests: guestStats.total || 0,
        todayCheckIn: guestStats.todayCheckIn || 0,
        todayCheckOut: guestStats.todayCheckOut || 0,
        totalSurveys: surveyStats.total || 0,
        // Add recent activities
        recentActivities: recentActivities,
        // Original structure
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
