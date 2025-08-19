import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllGuests, 
  createGuest
} from '@/backend/services/guestService';
import {
  getEducationOptions, 
  getProfessionOptions, 
  getBidangTujuanOptions, 
  getTujuanKunjunganOptions 
} from '@/backend/config/db';
import { GuestFormData } from '@/types/database-types';

// No mock data - we'll use real data from the database

export async function GET(request: NextRequest) {
  try {
    // Tables are now handled by migrations
    const guests = await getAllGuests();
    
    return NextResponse.json({ 
      success: true, 
      data: guests,
      message: 'Guests retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting guests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve guests', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST request with body:', body);
    
    // Validasi field wajib
    if (!body.nama) {
      return NextResponse.json(
        { success: false, message: 'Nama harus diisi' },
        { status: 400 }
      );
    }

    // Validasi jenis kelamin harus enum yang benar
    if (body.jenis_kelamin && !['Laki-laki', 'Perempuan'].includes(body.jenis_kelamin)) {
      return NextResponse.json(
        { success: false, message: 'Jenis kelamin harus "Laki-laki" atau "Perempuan"' },
        { status: 400 }
      );
    }

    // Pastikan data untuk guestFormData sesuai dengan struktur tabel daftar_tamu
    const guestData: GuestFormData = {
      nama: body.nama,
      email: body.email || '',
      nomor_telp: body.nomor_telp || undefined,
      alamat: body.alamat || '',
      jenis_kelamin: body.jenis_kelamin || 'Laki-laki',
      pendidikan_terakhir_id: body.pendidikan_terakhir_id ? parseInt(body.pendidikan_terakhir_id) : undefined,
      profesi_id: body.profesi_id ? parseInt(body.profesi_id) : undefined,
      asal_instansi: body.asal_instansi || undefined,
      keperluan: body.keperluan || 'Kunjungan umum',
      catatan: body.catatan || undefined, // Add catatan_tambahan
      bidang_tujuan_id: body.bidang_tujuan_id ? parseInt(body.bidang_tujuan_id) : undefined,
      tujuan_kunjungan_id: body.tujuan_kunjungan_id ? parseInt(body.tujuan_kunjungan_id) : undefined,
      file_upload: body.file_upload || undefined,
      cara_memperoleh: body.cara_memperoleh || undefined, // Pass checkbox data
      cara_salinan: body.cara_salinan || undefined // Pass checkbox data
    };

    const guestId = await createGuest(guestData);
    
    return NextResponse.json(
      { 
        success: true, 
        data: { id: guestId, ...guestData },
        message: 'Tamu berhasil terdaftar'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
