import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllGuests, 
  createGuest,
  getEducationOptions,
  getProfessionOptions
} from '@/backend/services/guestService';
import { initGuestTable } from '@/backend/services/guestService';

// Initialize the guest table when the API is first accessed
let initialized = false;
async function ensureTableInitialized() {
  if (!initialized) {
    await initGuestTable();
    initialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureTableInitialized();
    
    // Check if we're requesting options for dropdowns
    const { searchParams } = new URL(request.url);
    const optionsType = searchParams.get('options');
    
    if (optionsType === 'education') {
      const options = await getEducationOptions();
      return NextResponse.json({ success: true, data: options });
    } else if (optionsType === 'profession') {
      const options = await getProfessionOptions();
      return NextResponse.json({ success: true, data: options });
    }
    
    // Default: get all guests
    const guests = await getAllGuests();
    return NextResponse.json({ success: true, data: guests });
  } catch (error: any) {
    console.error('Error getting data:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['nama', 'jenis_kelamin', 'keperluan', 'tanggal_kunjungan', 'waktu_kunjungan'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    await ensureTableInitialized();
    const guestId = await createGuest(body);
    
    return NextResponse.json(
      { success: true, data: { id: guestId, ...body } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
