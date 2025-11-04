import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { GUEST_QUERIES } from '@/backend/models/guestModel';
import { apiLogger } from '@/lib/logger';
import { getIndonesiaTime } from '@/lib/timezone-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate request parameters
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID tamu tidak ditemukan' }, { status: 400 });
    }
    
    // Parse guest ID
    const guestId = parseInt(id, 10);
    if (isNaN(guestId)) {
      return NextResponse.json({ success: false, message: 'ID tamu tidak valid' }, { status: 400 });
    }

    // Parse request body to get the scheduled datetime
    const body = await request.json();
    
    apiLogger.debug('Schedule request received', {
      guestId,
      body
    });
    
    if (!body.scheduledDateTime) {
      return NextResponse.json({ success: false, message: 'Jadwal waktu kunjungan diperlukan' }, { status: 400 });
    }

    // Validate the date is not in the past (using Indonesia timezone for consistency)
    const scheduledDateTime = new Date(body.scheduledDateTime);
    const now = getIndonesiaTime();
    
    if (scheduledDateTime < now) {
      return NextResponse.json({ 
        success: false, 
        message: 'Jadwal waktu kunjungan tidak boleh di masa lalu' 
      }, { status: 400 });
    }

    // Extract additional fields from request body
    const bidangTujuanId = body.bidangTujuanId ? parseInt(body.bidangTujuanId) : null;
    const asnDituju = body.asnDituju || null;
    const caraSalinan = body.caraSalinan || [];
    
    // Make caraSalinan optional - removed validation that required at least one option
    
    // Start a transaction for multiple database operations
    await executeQuery('START TRANSACTION');
    
    try {
      // Update the guest record with the scheduled time, new fields, and jadwal_dibuat timestamp (using Indonesia time)
      const jadwalDibuat = getIndonesiaTime();
      await executeQuery(
        'UPDATE daftar_tamu SET jadwal_checkin = ?, bidang_tujuan_id = ?, asn_dituju = ?, jadwal_dibuat = ?, status_kunjungan = ? WHERE id = ?',
        [scheduledDateTime, bidangTujuanId, asnDituju, jadwalDibuat, 'Terjadwal', guestId]
      );
      
      // Only process cara_salinan if it's provided with values
      if (Array.isArray(caraSalinan) && caraSalinan.length > 0) {
        // Delete any existing cara_salinan entries for this guest
        await executeQuery(
          'DELETE FROM jawaban_mendapatkan_salinan WHERE tamu_id = ?',
          [guestId]
        );
        
        // Insert new cara_salinan entries
        for (const salinanId of caraSalinan) {
          await executeQuery(
            'INSERT INTO jawaban_mendapatkan_salinan (tamu_id, cara_salinan_id) VALUES (?, ?)',
            [guestId, salinanId]
          );
        }
      }
      
      // Commit the transaction
      await executeQuery('COMMIT');
      
      // Get updated guest data with jadwal_dibuat
      const updatedGuestData = await executeQuery<any[]>(
        'SELECT dt.jadwal_checkin, dt.jadwal_dibuat, dt.status_kunjungan, dt.bidang_tujuan_id, bt.bidang as bidang_tujuan, dt.asn_dituju FROM daftar_tamu dt LEFT JOIN bidang_tujuan bt ON dt.bidang_tujuan_id = bt.id WHERE dt.id = ?',
        [guestId]
      );
      
      const updatedGuest = updatedGuestData && updatedGuestData.length > 0 ? updatedGuestData[0] : null;
      
      // Get cara_mendapatkan_salinan details
      let cara_mendapatkan_salinan = [];
      if (Array.isArray(caraSalinan) && caraSalinan.length > 0) {
        const salinanDetails = await executeQuery<any[]>(
          'SELECT ms.nama_opsi FROM jawaban_mendapatkan_salinan jms JOIN mendapatkan_salinan ms ON jms.cara_salinan_id = ms.id WHERE jms.tamu_id = ?',
          [guestId]
        );
        
        if (salinanDetails && salinanDetails.length > 0) {
          cara_mendapatkan_salinan = salinanDetails.map(item => item.nama_opsi);
        }
      }
  
      return NextResponse.json({ 
        success: true, 
        message: 'Jadwal kunjungan berhasil diatur',
        data: {
          scheduledDateTime,
          jadwal_dibuat: updatedGuest?.jadwal_dibuat || jadwalDibuat.toISOString(),
          status_kunjungan: 'Terjadwal',
          bidang_tujuan_id: updatedGuest?.bidang_tujuan_id || bidangTujuanId,
          bidang_tujuan: updatedGuest?.bidang_tujuan || null,
          asn_dituju: updatedGuest?.asn_dituju || asnDituju,
          cara_mendapatkan_salinan // Using the expected field name
        }
      });
    } catch (error) {
      // If any error occurs, rollback the transaction
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in schedule guest route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menjadwalkan kunjungan' 
    }, { status: 500 });
  }
}
