import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllGuests, 
  createGuest,
  getEducationOptions,
  getProfessionOptions
} from '@/backend/services/guestService';
import { initializeTables } from '@/backend/config/db';
import { GuestFormData } from '@/types/database-types';

export async function GET(request: NextRequest) {
  try {
    await ensureTableInitialized();
    const guests = await getAllGuests();
    return NextResponse.json({ 
      success: true, 
      data: guests,
      message: 'Guests retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting data:', error);
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
    const requiredFields = ['name', 'email', 'message', 'purpose'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
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
