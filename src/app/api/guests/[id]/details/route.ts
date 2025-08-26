import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import { getGuestById } from '@/backend/services/guestService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id?: string }> }
) {
  try {
    // Await params before using them
    const params = await context.params;
    
    // Pastikan params ada dan id tidak kosong
    if (!params?.id) {
      return NextResponse.json({ success: false, message: 'ID tamu tidak ditemukan' }, { status: 400 });
    }
    
    // Ambil id dan pastikan valid sebagai angka
    const id = String(params.id);
    const guestId = parseInt(id, 10);
    if (isNaN(guestId)) {
      return NextResponse.json({ success: false, message: 'ID tamu tidak valid' }, { status: 400 });
    }

    // Get basic guest information
    const guest = await getGuestById(guestId);

    if (!guest) {
      return NextResponse.json({ success: false, message: 'Tamu tidak ditemukan' }, { status: 404 });
    }

    // Get bidang tujuan name
    let bidangTujuan = null;
    if (guest.bidang_tujuan_id) {
      const bidangResult = await executeQuery<Array<{ bidang: string }>>(
        'SELECT bidang FROM bidang_tujuan WHERE id = ?', 
        [guest.bidang_tujuan_id]
      );
      if (bidangResult.length > 0) {
        bidangTujuan = bidangResult[0].bidang;
      }
    }

    // Get cara memperoleh informasi selections
    let caraMendapatkanInformasi: string[] = [];
    try {
      const informasiQuery = `
        SELECT m.nama_opsi 
        FROM jawaban_memperoleh_informasi j
        JOIN memperoleh_informasi m ON j.cara_memperoleh_id = m.id
        WHERE j.tamu_id = ?
      `;
      const informasiResult = await executeQuery<Array<{ nama_opsi: string }>>(informasiQuery, [guestId]);
      caraMendapatkanInformasi = informasiResult.map(item => item.nama_opsi);
    } catch (error) {
      console.error('Error fetching memperoleh informasi data:', error);
    }

    // Get cara mendapatkan salinan selections
    let caraSalinan: string[] = [];
    try {
      const salinanQuery = `
        SELECT m.nama_opsi 
        FROM jawaban_mendapatkan_salinan j
        JOIN mendapatkan_salinan m ON j.cara_salinan_id = m.id
        WHERE j.tamu_id = ?
      `;
      const salinanResult = await executeQuery<Array<{ nama_opsi: string }>>(salinanQuery, [guestId]);
      caraSalinan = salinanResult.map(item => item.nama_opsi);
    } catch (error) {
      console.error('Error fetching mendapatkan salinan data:', error);
    }

    // Add the additional information to the guest object
    const guestWithDetails = {
      ...guest,
      bidang_tujuan: bidangTujuan,
      cara_memperoleh_informasi: caraMendapatkanInformasi,
      cara_mendapatkan_salinan: caraSalinan
    };

    return NextResponse.json({ 
      success: true, 
      data: guestWithDetails 
    });
  } catch (error) {
    console.error('Error in guest details route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil data tamu' 
    }, { status: 500 });
  }
}
