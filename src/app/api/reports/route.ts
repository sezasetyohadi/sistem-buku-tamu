import { NextResponse } from 'next/server';
import { getReportsStatistics, getRecentActivities } from '@/backend/services/guestService';

export async function GET() {
  try {
    const [reportsData, recentActivities] = await Promise.all([
      getReportsStatistics(),
      getRecentActivities(5)
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        ...reportsData,
        recentActivities: recentActivities
      },
      message: 'Reports data retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting reports data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve reports data', error: error.message },
      { status: 500 }
    );
  }
}
