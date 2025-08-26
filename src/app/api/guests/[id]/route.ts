import { NextRequest, NextResponse } from 'next/server';
import { 
  getGuestById, 
  updateGuest, 
  deleteGuest
} from '@/backend/services/guestService';

interface Params {
  params: Promise<{
    id: string;
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const guestId = parseInt(id);
    if (isNaN(guestId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const guest = await getGuestById(guestId);
    if (!guest) {
      return NextResponse.json(
        { success: false, message: 'Guest not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: guest });
  } catch (error: any) {
    console.error('Error getting guest:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const guestId = parseInt(id);
    if (isNaN(guestId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const success = await updateGuest(guestId, body);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Guest not found or no changes made' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: { id, ...body } });
  } catch (error: any) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const guestId = parseInt(id);
    if (isNaN(guestId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const success = await deleteGuest(guestId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Guest not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting guest:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const guestId = parseInt(id);
    if (isNaN(guestId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Update guest with the provided data
    const success = await updateGuest(guestId, body);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Guest not found or failed to update' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Guest updated successfully',
      data: { id, ...body }
    });
  } catch (error: any) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
