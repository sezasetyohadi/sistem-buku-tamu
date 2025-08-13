import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Route not available in this mode',
      message: 'This API endpoint is not accessible in the current application mode.'
    },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Route not available in this mode',
      message: 'This API endpoint is not accessible in the current application mode.'
    },
    { status: 404 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Route not available in this mode',
      message: 'This API endpoint is not accessible in the current application mode.'
    },
    { status: 404 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Route not available in this mode',
      message: 'This API endpoint is not accessible in the current application mode.'
    },
    { status: 404 }
  );
}
