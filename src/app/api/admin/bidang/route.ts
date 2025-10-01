import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import { verifyToken } from '@/lib/jwt';

// Define the structure of bidang_tujuan table
interface BidangTujuan {
  id: number;
  bidang: string;
  created_at?: string;
  updated_at?: string;
}

// GET endpoint to fetch all bidang_tujuan or specific one by ID
export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'No access token provided',
      }, { status: 401 });
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Check if ID is provided as a query parameter
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    let query = 'SELECT id, bidang FROM bidang_tujuan';
    let params: any[] = [];

    // If ID is provided, fetch specific bidang_tujuan
    if (id) {
      query += ' WHERE id = ?';
      params.push(id);
    }

    query += ' ORDER BY bidang ASC';
    
    const result = await executeQuery<BidangTujuan[]>(query, params);

    if (id && (!result || result.length === 0)) {
      return NextResponse.json({
        success: false,
        message: 'Bidang not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      bidang: id ? result[0] : result,
    });

  } catch (error) {
    console.error('Error fetching bidang data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bidang data',
    }, { status: 500 });
  }
}