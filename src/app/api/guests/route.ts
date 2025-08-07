import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllGuests, 
  createGuest 
} from '@/backend/services/guestService';
import { initializeTables } from '@/backend/config/db';
import { GuestFormData } from '@/types/database-types';

// Mock data untuk development
const mockGuests = [
  {
    id: 1,
    nama: 'Ahmad Zaki',
    email: 'ahmad.zaki@email.com',
    alamat: 'Jl. Sudirman No. 123, Semarang',
    jenis_kelamin: 'Laki-laki',
    pendidikan_terakhir: 'S1',
    profesi: 'Software Engineer',
    asal_instansi: 'PT. Tech Indonesia',
    keperluan: 'Konsultasi mengenai program pelatihan kerja',
    tanggal_kunjungan: new Date().toISOString().split('T')[0],
    waktu_kunjungan: '09:30:00',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@email.com',
    alamat: 'Jl. Diponegoro No. 456, Yogyakarta',
    jenis_kelamin: 'Perempuan',
    pendidikan_terakhir: 'S2',
    profesi: 'Manager',
    asal_instansi: 'CV. Maju Bersama',
    keperluan: 'Pengurusan izin tenaga kerja asing',
    tanggal_kunjungan: new Date().toISOString().split('T')[0],
    waktu_kunjungan: '10:15:00',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    alamat: 'Jl. Pemuda No. 789, Solo',
    jenis_kelamin: 'Laki-laki',
    pendidikan_terakhir: 'SMA/SMK',
    profesi: 'Wiraswasta',
    asal_instansi: 'Toko Berkah Jaya',
    keperluan: 'Informasi program bantuan UMKM',
    tanggal_kunjungan: new Date().toISOString().split('T')[0],
    waktu_kunjungan: '11:00:00',
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  try {
    // Try to initialize tables and get real data
    await initializeTables();
    const guests = await getAllGuests();
    
    return NextResponse.json({ 
      success: true, 
      data: guests.length > 0 ? guests : mockGuests,
      message: guests.length > 0 ? 'Guests retrieved successfully' : 'Using mock data - database not available',
      isUsingMockData: guests.length === 0
    });
  } catch (error: any) {
    console.error('Error getting guests:', error);
    
    // Return mock data if database is not available
    return NextResponse.json({ 
      success: true, 
      data: mockGuests,
      message: 'Using mock data - database connection failed',
      isUsingMockData: true,
      error: error.message
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GuestFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.purpose) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and purpose are required' },
        { status: 400 }
      );
    }

    const guestId = await createGuest(body);
    
    if (guestId > 0) {
      return NextResponse.json(
        { 
          success: true, 
          data: { id: guestId, ...body },
          message: 'Guest registered successfully'
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to register guest' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
