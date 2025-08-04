import { NextRequest, NextResponse } from 'next/server';
import { 
  getGuestById, 
  updateGuest, 
  deleteGuest, 
  checkOutGuest 
} from '@/backend/services/guestService';

interface Params {
  params: {
    id: string;
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const guest = await getGuestById(id);
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
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const success = await updateGuest(id, body);
    
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
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const success = await deleteGuest(id);
    
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
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // This endpoint is specifically for checking out a guest
    const success = await checkOutGuest(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Guest not found or already checked out' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Guest checked out successfully',
      data: { id, check_out: new Date() }
    });
  } catch (error: any) {
    console.error('Error checking out guest:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
