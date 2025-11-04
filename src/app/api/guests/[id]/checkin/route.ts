import { NextRequest, NextResponse } from 'next/server';

import { updateGuestCheckIn, updateGuestCheckInWithInfo, Guest } from '@/backend/models/guestModel';
import { saveMendapatkanSalinanAnswers } from '@/backend/services/guestService';
import { executeQuery } from '@/backend/config/db';

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
      try {
        // Delete existing cara salinan entries for this guest first
        await executeQuery(
          'DELETE FROM jawaban_mendapatkan_salinan WHERE tamu_id = ?',
          [guestId]
        );

        // Save new cara mendapatkan salinan answers
        await saveMendapatkanSalinanAnswers(guestId, caraSalinan);
        //console.log('Cara mendapatkan salinan saved successfully:', caraSalinan);
      } catch (salinanError) {
        console.error('Error saving cara mendapatkan salinan:', salinanError);
        // Don't fail the checkin if salinan saving fails, just log the error
      }
    }

    // Get updated cara mendapatkan salinan data for response
    let cara_mendapatkan_salinan: string[] = [];
    let cara_mendapatkan_salinan_ids: number[] = [];
    
    try {
      const salinanQuery = `
        SELECT m.id, m.nama_opsi 
        FROM jawaban_mendapatkan_salinan j
        JOIN mendapatkan_salinan m ON j.cara_salinan_id = m.id
        WHERE j.tamu_id = ?
      `;
      const salinanResult = await executeQuery<Array<{ id: number; nama_opsi: string }>>(salinanQuery, [guestId]);
      cara_mendapatkan_salinan = salinanResult.map(item => item.nama_opsi);
      cara_mendapatkan_salinan_ids = salinanResult.map(item => item.id);
    } catch (salinanError) {
      console.error('Error fetching updated cara mendapatkan salinan:', salinanError);
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
        asn_dituju: updatedGuest.asn_dituju,
        cara_mendapatkan_salinan,
        cara_mendapatkan_salinan_ids
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
