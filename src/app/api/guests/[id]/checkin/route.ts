import { NextRequest, NextResponse } from 'next/server';

import { updateGuestCheckIn, updateGuestCheckInWithInfo, Guest } from '@/backend/models/guestModel';

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

    // Parse request body for additional checkin information
    const body = await request.json().catch(() => ({}));
    const { bidangTujuanId, asnDituju, caraSalinan } = body;

    // Perform check-in operation
    const now = new Date();
    let result;

    // Check if additional information is provided
    if (bidangTujuanId && asnDituju) {
      // Use checkin with additional information
      result = await updateGuestCheckInWithInfo(guestId, now, bidangTujuanId, asnDituju);
    } else {
      // Use simple checkin (preserves existing bidang_tujuan_id and asn_dituju)
      result = await updateGuestCheckIn(guestId, now);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Gagal melakukan check-in tamu' },
        { status: 500 }
      );
    }

    // Handle cara mendapatkan salinan if provided
    if (caraSalinan && Array.isArray(caraSalinan) && caraSalinan.length > 0) {
      // TODO: Implement cara salinan handling if needed
      // For now, we'll just log it
      //console.log('Cara mendapatkan salinan selected:', caraSalinan);
    }

    // Return success response with updated guest data
    const updatedGuest = result.data as Guest;
    return NextResponse.json({
      success: true,
      message: 'Tamu berhasil ditandai datang',
      data: {
        waktu_checkin: updatedGuest.waktu_checkin,
        status_kunjungan: updatedGuest.status_kunjungan,
        bidang_tujuan_id: updatedGuest.bidang_tujuan_id,
        asn_dituju: updatedGuest.asn_dituju
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
