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
    
    // Hanya validasi field paling penting
    if (!body.nama) {
      return NextResponse.json(
        { success: false, message: 'Nama harus diisi' },
        { status: 400 }
      );
    }

    // Pastikan data untuk guestFormData terbentuk dengan benar
    const guestData: GuestFormData = {
      nama: body.nama || '',
      email: body.email || '',
      alamat: body.alamat || '',
      jenis_kelamin: body.jenis_kelamin || 'Laki-laki',
      keperluan: body.keperluan || 'Kunjungan',
      // Field opsional
      nomor_telp: body.nomor_telp,
      pendidikan_terakhir_id: body.pendidikan_terakhir_id ? parseInt(body.pendidikan_terakhir_id) : undefined,
      profesi_id: body.profesi_id ? parseInt(body.profesi_id) : undefined,
      asal_instansi: body.asal_instansi,
      waktu_kunjungan: body.waktu_kunjungan,
      bidang_tujuan_id: body.bidang_tujuan_id,
      tujuan_kunjungan_id: body.tujuan_kunjungan_id
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
