import { executeQuery } from '../config/db';
import { DaftarTamu, JawabanSurvei, GuestFormData, SurveyFormData, DatabaseResult } from '../../types/database-types';

// Guest Service untuk tabel daftar_tamu
export async function getAllGuests(): Promise<DaftarTamu[]> {
  const query = `
    SELECT * FROM daftar_tamu 
    ORDER BY tanggal_kunjungan DESC, waktu_kunjungan DESC
  `;
  return executeQuery<DaftarTamu[]>(query);
}

export async function getGuestById(id: number): Promise<DaftarTamu | null> {
  const query = 'SELECT * FROM daftar_tamu WHERE id = ?';
  const guests = await executeQuery<DaftarTamu[]>(query, [id]);
  return guests.length > 0 ? guests[0] : null;
}

export async function createGuest(formData: GuestFormData): Promise<number> {
  const query = `
    INSERT INTO daftar_tamu (
      nama, email, alamat, jenis_kelamin, pendidikan_terakhir, 
      profesi, asal_instansi, keperluan, tanggal_kunjungan, waktu_kunjungan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME())
  `;
  
  const params = [
    formData.name,
    formData.email,
    formData.address,
    formData.gender,
    formData.education,
    formData.profession,
    formData.company,
    formData.purpose
  ];

  const result = await executeQuery<any>(query, params);
  return result.insertId;
}

export async function updateGuest(id: number, data: Partial<DaftarTamu>): Promise<boolean> {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  
  const query = `UPDATE daftar_tamu SET ${fields} WHERE id = ?`;
  const result = await executeQuery<any>(query, [...values, id]);
  
  return result.affectedRows > 0;
}

export async function deleteGuest(id: number): Promise<boolean> {
  const query = 'DELETE FROM daftar_tamu WHERE id = ?';
  const result = await executeQuery<any>(query, [id]);
  return result.affectedRows > 0;
}

export async function searchGuests(searchTerm: string): Promise<DaftarTamu[]> {
  const query = `
    SELECT * FROM daftar_tamu 
    WHERE nama LIKE ? 
       OR email LIKE ? 
       OR asal_instansi LIKE ? 
       OR keperluan LIKE ?
    ORDER BY tanggal_kunjungan DESC
  `;
  
  const searchPattern = `%${searchTerm}%`;
  const params = [searchPattern, searchPattern, searchPattern, searchPattern];
  
  return executeQuery<DaftarTamu[]>(query, params);
}

// Survey Service untuk tabel jawaban_survei
export async function submitSurvey(formData: SurveyFormData): Promise<boolean> {
  try {
    const query = `
      INSERT INTO jawaban_survei (
        nama_lengkap, jenis_kelamin, pendidikan_terakhir, 
        profesi, instansi, pertanyaan_id, jawaban, saran
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      formData.name,
      'Laki-laki', // default gender
      formData.education || '',
      formData.profession || '',
      formData.institution || '',
      1, // default pertanyaan_id
      parseInt(formData.overallRating) || 5,
      formData.feedback
    ];

    const result = await executeQuery<any>(query, params);
    return result.insertId > 0;
    
  } catch (error) {
    console.error('Error submitting survey:', error);
    return false;
  }
}

export async function getAllSurveyResponses(): Promise<JawabanSurvei[]> {
  const query = `
    SELECT * FROM jawaban_survei 
    ORDER BY created_at DESC
  `;
  return executeQuery<JawabanSurvei[]>(query);
}

export async function initGuestTable(): Promise<void> {
  // Database tables are already created via SQL dump
  // This function can be used for additional setup if needed
  console.log('Database tables initialized via SQL dump');
}
