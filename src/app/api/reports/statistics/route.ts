import { NextRequest, NextResponse } from 'next/server';
import { getReportsStatistics } from '@/backend/services/guestService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7'; // Default 7 days
    
    const reportsData = await getReportsStatistics(parseInt(period));

    return NextResponse.json({ 
      success: true, 
      data: reportsData,
      message: 'Reports statistics retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting reports statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve reports statistics', error: error.message },
      { status: 500 }
    );
  }
}
