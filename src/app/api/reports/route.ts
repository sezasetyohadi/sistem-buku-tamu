import { NextRequest, NextResponse } from 'next/server';

import { getReportsStatistics, getRecentActivities } from '@/backend/services/guestService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7'; // Default 7 days
    
    const [reportsData, recentActivities] = await Promise.all([
      getReportsStatistics(parseInt(period)),
      getRecentActivities(5, parseInt(period))
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
