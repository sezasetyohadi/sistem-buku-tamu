import { NextRequest, NextResponse } from 'next/server';
import { updateGuestCheckOut, Guest } from '@/backend/models/guestModel';
import { executeQuery } from '@/backend/config/db';

export async function POST(
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

    const body = await request.json();
    const deactivateToken = body?.deactivateToken;

    // Perform check-out operation
    const now = new Date();
    const result = await updateGuestCheckOut(guestId, now);

    // Jika sukses dan flag deactivateToken true, update tamu_token
    if (result.success && deactivateToken) {
      await executeQuery(
        'UPDATE tamu_token SET is_active = 0 WHERE tamu_id = ? AND is_active = 1',
        [guestId]
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Gagal melakukan check-out tamu' },
        { status: 500 }
      );
    }

    // Return success response with updated guest data
    const updatedGuest = result.data as Guest;
    return NextResponse.json({
      success: true,
      message: 'Kunjungan tamu berhasil ditandai selesai',
      data: {
        waktu_checkout: updatedGuest.waktu_checkout,
        status_kunjungan: updatedGuest.status_kunjungan
      }
    });
  } catch (error: any) {
    console.error('Error in checkout API:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat memproses check-out' },
      { status: 500 }
    );
  }
}
