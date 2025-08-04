import { NextRequest, NextResponse } from 'next/server';
import { 
  getGuestById, 
  updateGuest, 
  deleteGuest,
  setGuestFeedback 
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
    
    const body = await request.json();
    // This endpoint is for setting guest feedback
    const success = await setGuestFeedback(id, body.tanggapan);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Guest not found or feedback already set' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Guest feedback recorded successfully',
      data: { id, tanggapan: body.tanggapan }
    });
  } catch (error: any) {
    console.error('Error checking out guest:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
