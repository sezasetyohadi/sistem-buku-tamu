// API helper function to look up guest by email
import { GuestIdentity } from '@/types/survey-types';

/**
 * Fetch guest data by email to auto-fill survey form
 */
export async function fetchGuestByEmail(email: string): Promise<{
  found: boolean;
  guest?: any;
  hasSubmittedSurvey?: boolean;
}> {
  try {
    const response = await fetch(`/api/guests/by-email?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    
    throw new Error(data.message || 'Failed to fetch guest data');
  } catch (error) {
    console.error('Error fetching guest by email:', error);
    return { found: false };
  }
}

/**
 * Map guest data from database to GuestIdentity format
 */
export function mapGuestDataToIdentity(guestData: any): GuestIdentity {
  // Special handling for "Lainnya" option in keperluan field
  let jenisLayanan = guestData.keperluan || '';
  let catatan_tambahan = '';
  
  // Standard options for tujuan kunjungan
  const standardOptions = ['Konsultasi Layanan', 'Pengaduan/Keluhan', 'Pengajuan Permohonan', 
                           'Mencari Informasi', 'Meeting/Rapat', 'Survey/Penelitian'];
  
  // Check if the purpose is a non-standard option (including "Lainnya")
  if (!standardOptions.includes(jenisLayanan)) {
    // If it's not in standard options, it should be "Lainnya"
    if (jenisLayanan) {
      catatan_tambahan = jenisLayanan; // Save the original value as notes
      jenisLayanan = 'Lainnya'; // Set to "Lainnya"
    } else {
      jenisLayanan = ''; // If it's empty, keep it empty
    }
  }
  
  return {
    id: 1, // Default ID for the form
    tamu_id: guestData.id ? Number(guestData.id) : undefined, // Actual guest ID from database, ensure it's a number
    nama: guestData.nama || '',
    email: guestData.email || '',
    nomor_telp: guestData.nomor_telp || '',
    tanggal_lahir: guestData.tanggal_lahir || '',
    jenis_kelamin: guestData.jenis_kelamin || '',
    alamat: guestData.alamat || '',
    pendidikan_terakhir: guestData.pendidikan_terakhir || '',
    pekerjaan_utama: guestData.profesi || '',
    jenis_layanan: jenisLayanan,
    catatan_tambahan: catatan_tambahan // Add the notes field
  };
}
