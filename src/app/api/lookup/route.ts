import { NextResponse } from 'next/server';

import { 
  getEducationOptions, 
  getProfessionOptions, 
  getTujuanKunjunganOptions,
  getBidangTujuanOptions,
  getMemperolehInformasiOptions,
  getMendapatkanSalinanOptions,
  getLayananDisnakerOptions
} from '@/backend/config/db';

export async function GET() {
  try {
    // Lookup data from database tables
    
    const [educationLevels, professions, tujuanKunjungan, bidangTujuan, memperolehInformasi, mendapatkanSalinan, layananDisnaker] = await Promise.all([
      getEducationOptions(),
      getProfessionOptions(),
      getTujuanKunjunganOptions(),
      getBidangTujuanOptions(),
      getMemperolehInformasiOptions(),
      getMendapatkanSalinanOptions(),
      getLayananDisnakerOptions()
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        educationLevels,
        professions,
        tujuanKunjungan,
        bidangTujuan,
        memperolehInformasi,
        mendapatkanSalinan,
        layananDisnaker
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
