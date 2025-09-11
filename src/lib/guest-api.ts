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
  
  // If keperluan is "Lainnya" or not in standard options, set to empty string
  // This will let the user select from the dropdown
  const standardOptions = ['Konsultasi Layanan', 'Pengaduan/Keluhan', 'Pengajuan Permohonan', 
                           'Mencari Informasi', 'Meeting/Rapat', 'Survey/Penelitian'];
  
  if (!standardOptions.includes(jenisLayanan)) {
    jenisLayanan = '';
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
    jenis_layanan: jenisLayanan
  };
}
