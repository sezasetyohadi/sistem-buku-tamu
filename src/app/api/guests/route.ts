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

// Mock data untuk development
const mockGuests = [
  {
    id: 1,
    nama: 'Ahmad Zaki',
    email: 'ahmad.zaki@email.com',
    nomor_telp: '08123456789',
    alamat: 'Jl. Sudirman No. 123, Semarang',
    jenis_kelamin: 'Laki-laki',
    pendidikan_terakhir: 'S1',
    profesi: 'PNS',
    asal_instansi: 'PT. Tech Indonesia',
    keperluan: 'Konsultasi mengenai program pelatihan kerja',
    waktu_kunjungan: '09:30:00',
    bidang_tujuan_id: 2,
    tujuan_kunjungan_id: 1,
    tanggapan: 'Menunggu',
    waktu_dibuat: new Date().toISOString()
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@email.com',
    nomor_telp: '08567890123',
    alamat: 'Jl. Diponegoro No. 456, Yogyakarta',
    jenis_kelamin: 'Perempuan',
    pendidikan_terakhir: 'S2',
    profesi: 'Pegawai Swasta',
    asal_instansi: 'CV. Maju Bersama',
    keperluan: 'Pengurusan izin tenaga kerja asing',
    waktu_kunjungan: '10:15:00',
    bidang_tujuan_id: 3,
    tujuan_kunjungan_id: 3,
    tanggapan: 'Check-in',
    waktu_dibuat: new Date().toISOString()
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    nomor_telp: '08912345678',
    alamat: 'Jl. Pemuda No. 789, Solo',
    jenis_kelamin: 'Laki-laki',
    pendidikan_terakhir: 'SMA/SMK',
    profesi: 'Wiraswasta',
    asal_instansi: 'Toko Berkah Jaya',
    keperluan: 'Informasi program bantuan UMKM',
    waktu_kunjungan: '11:00:00',
    bidang_tujuan_id: 1,
    tujuan_kunjungan_id: 4,
    tanggapan: 'Check-out',
    waktu_dibuat: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    // Tables are now handled by migrations
    const guests = await getAllGuests();
    
    return NextResponse.json({ 
      success: true, 
      data: guests.length > 0 ? guests : mockGuests,
      message: guests.length > 0 ? 'Guests retrieved successfully' : 'Using mock data - database not available',
      isUsingMockData: guests.length === 0
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
