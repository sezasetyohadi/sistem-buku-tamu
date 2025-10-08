import { NextRequest, NextResponse } from 'next/server';

import { getReportsStatistics, getRecentActivities } from '@/backend/services/guestService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7'; // Default 7 days
    const bidangTujuanId = searchParams.get('bidangTujuanId');
    
    // Convert bidangTujuanId to number if it exists
    // Note: special handling for super admin (bidang_tujuan_id = 999)
    // Super admin either has no bidangTujuanId parameter or it equals 999
    let departmentId = bidangTujuanId ? parseInt(bidangTujuanId) : undefined;
    if (departmentId === 999) {
      // For super admin, don't filter by department (set to undefined)
      departmentId = undefined;
    }
    
    console.log('Reports API: Getting statistics for period:', period, 'departmentId:', departmentId);
    
    const [reportsData, recentActivities] = await Promise.all([
      getReportsStatistics(parseInt(period), departmentId),
      getRecentActivities(5, parseInt(period), departmentId)
    ]);

    console.log('Reports API: Statistics result:', JSON.stringify(reportsData, null, 2));
    console.log('Reports API: Recent activities count:', recentActivities?.length);

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
