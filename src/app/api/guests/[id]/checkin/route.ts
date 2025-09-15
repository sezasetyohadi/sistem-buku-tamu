import { NextRequest, NextResponse } from 'next/server';
import { updateGuestCheckIn, Guest } from '@/backend/models/guestModel';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guestId = parseInt(id);

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
    const updatedGuest = result.data as Guest;
    return NextResponse.json({
      success: true,
      message: 'Tamu berhasil ditandai datang',
      data: {
        waktu_checkin: updatedGuest.waktu_checkin,
        status_kunjungan: updatedGuest.status_kunjungan
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
