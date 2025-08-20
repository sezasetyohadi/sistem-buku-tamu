import { NextRequest, NextResponse } from 'next/server';
import { updateGuestCheckIn } from '@/backend/models/guestModel';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guestId = parseInt(params.id);

    // Validate guest ID
    if (isNaN(guestId)) {
      return NextResponse.json(
        { success: false, message: 'ID tamu tidak valid' },
        { status: 400 }
      );
    }

    // Perform check-in operation
    const now = new Date();
    const result = await updateGuestCheckIn(guestId, now);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Gagal melakukan check-in tamu' },
        { status: 500 }
      );
    }

    // Return success response with updated guest data
    return NextResponse.json({
      success: true,
      message: 'Tamu berhasil ditandai datang',
      data: {
        waktu_checkin: result.data?.waktu_checkin,
        status_kunjungan: result.data?.status_kunjungan
      }
    });
  } catch (error: any) {
    console.error('Error in checkin API:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat memproses check-in' },
      { status: 500 }
    );
  }
}
