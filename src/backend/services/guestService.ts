import { executeQuery } from '../config/db';
import { Guest, GuestCreate, GuestUpdate, GUEST_QUERIES } from '../models/guestModel';

interface EducationOption {
  id: number;
  pendidikan_terakhir: string;
}

interface ProfessionOption {
  id: number;
  nama_profesi: string;
}

export async function getAllGuests(): Promise<Guest[]> {
  return executeQuery<Guest[]>(GUEST_QUERIES.GET_ALL);
}

export async function getGuestById(id: number): Promise<Guest | null> {
  const guests = await executeQuery<Guest[]>(GUEST_QUERIES.GET_BY_ID, [id]);
  return guests.length > 0 ? guests[0] : null;
}

export async function createGuest(guest: GuestCreate): Promise<number> {
  const { 
    nama, 
    alamat, 
    jenis_kelamin, 
    pendidikan_terakhir, 
    profesi, 
    asal_instansi, 
    keperluan,
    tanggal_kunjungan,
    waktu_kunjungan,
    email,
    file_upload
  } = guest;
  
  // Gunakan tanggal sekarang jika tidak ada tanggal yang diberikan
  const visitDate = tanggal_kunjungan || new Date().toISOString().split('T')[0];
  // Gunakan waktu sekarang jika tidak ada waktu yang diberikan
  const visitTime = waktu_kunjungan || new Date().toTimeString().split(' ')[0];
  
  const result = await executeQuery<any>(
    GUEST_QUERIES.CREATE, 
    [
      nama, 
      alamat || null, 
      jenis_kelamin, 
      pendidikan_terakhir || null, 
      profesi || null, 
      asal_instansi || null, 
      keperluan,
      visitDate,
      visitTime, 
      email || null,
      file_upload || null
    ]
  );
  return result.insertId;
}

export async function updateGuest(id: number, guest: GuestUpdate): Promise<boolean> {
  const result = await executeQuery<any>(GUEST_QUERIES.UPDATE, [guest, id]);
  return result.affectedRows > 0;
}

export async function deleteGuest(id: number): Promise<boolean> {
  const result = await executeQuery<any>(GUEST_QUERIES.DELETE, [id]);
  return result.affectedRows > 0;
}

export async function setGuestFeedback(id: number, tanggapan: boolean): Promise<boolean> {
  const result = await executeQuery<any>(GUEST_QUERIES.SET_TANGGAPAN, [tanggapan, id]);
  return result.affectedRows > 0;
}

export async function getEducationOptions(): Promise<EducationOption[]> {
  return executeQuery<EducationOption[]>(GUEST_QUERIES.GET_EDUCATION_OPTIONS);
}

export async function getProfessionOptions(): Promise<ProfessionOption[]> {
  return executeQuery<ProfessionOption[]>(GUEST_QUERIES.GET_PROFESSION_OPTIONS);
}

export async function initGuestTable(): Promise<void> {
  await executeQuery(GUEST_QUERIES.CREATE_TABLE);
}
