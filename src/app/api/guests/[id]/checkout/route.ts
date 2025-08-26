import { NextRequest, NextResponse } from 'next/server';
import { updateGuestCheckOut } from '@/backend/models/guestModel';

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

    // Perform check-out operation
    const now = new Date();
    const result = await updateGuestCheckOut(guestId, now);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Gagal melakukan check-out tamu' },
        { status: 500 }
      );
    }

    // Return success response with updated guest data
    return NextResponse.json({
      success: true,
      message: 'Kunjungan tamu berhasil ditandai selesai',
      data: {
        waktu_checkout: result.data?.waktu_checkout,
        status_kunjungan: result.data?.status_kunjungan
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
