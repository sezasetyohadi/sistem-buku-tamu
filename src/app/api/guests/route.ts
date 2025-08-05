import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllGuests, 
  createGuest 
} from '@/backend/services/guestService';
import { GuestFormData } from '@/types/database-types';

export async function GET() {
  try {
    const guests = await getAllGuests();
    return NextResponse.json({ 
      success: true, 
      data: guests,
      message: 'Guests retrieved successfully' 
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
