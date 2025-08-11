import { NextResponse } from 'next/server';
import { 
  getEducationOptions, 
  getProfessionOptions, 
  getBidangTujuanOptions, 
  getTujuanKunjunganOptions
} from '@/backend/config/db';

export async function GET() {
  try {
    // Tables are now handled by migrations
    
    const [educationLevels, professions, bidangTujuan, tujuanKunjungan] = await Promise.all([
      getEducationOptions(),
      getProfessionOptions(),
      getBidangTujuanOptions(),
      getTujuanKunjunganOptions()
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        educationLevels,
        professions,
        bidangTujuan,
        tujuanKunjungan
      },
      message: 'Lookup data retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error getting lookup data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve lookup data', error: error.message },
      { status: 500 }
    );
  }
}
