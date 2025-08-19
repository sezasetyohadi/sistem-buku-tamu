import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import { GUEST_QUERIES } from '@/backend/models/guestModel';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate request parameters
    if (!params || !params.id) {
      return NextResponse.json({ success: false, message: 'ID tamu tidak ditemukan' }, { status: 400 });
    }
    
    // Parse guest ID
    const id = String(params.id);
    const guestId = parseInt(id, 10);
    if (isNaN(guestId)) {
      return NextResponse.json({ success: false, message: 'ID tamu tidak valid' }, { status: 400 });
    }

    // Parse request body to get the scheduled datetime
    const body = await request.json();
    
    if (!body.scheduledDateTime) {
      return NextResponse.json({ success: false, message: 'Jadwal waktu kunjungan diperlukan' }, { status: 400 });
    }

    // Validate the date is not in the past
    const scheduledDateTime = new Date(body.scheduledDateTime);
    const now = new Date();
    
    if (scheduledDateTime < now) {
      return NextResponse.json({ 
        success: false, 
        message: 'Jadwal waktu kunjungan tidak boleh di masa lalu' 
      }, { status: 400 });
    }

    // Update the guest record with the scheduled time
    await executeQuery(
      GUEST_QUERIES.SET_SCHEDULE, 
      [scheduledDateTime, guestId]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Jadwal kunjungan berhasil diatur',
      data: { scheduledDateTime }
    });
  } catch (error) {
    console.error('Error in schedule guest route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menjadwalkan kunjungan' 
    }, { status: 500 });
  }
}
