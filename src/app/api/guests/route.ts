import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllGuests, 
  createGuest 
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

export async function GET() {
  try {
    await ensureTableInitialized();
    const guests = await getAllGuests();
    return NextResponse.json({ success: true, data: guests });
  } catch (error: any) {
    console.error('Error getting guests:', error);
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
    const requiredFields = ['name', 'email', 'message', 'purpose'];
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
