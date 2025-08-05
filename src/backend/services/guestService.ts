import { executeQuery } from '../config/db';
import { DaftarTamu, JawabanSurvei, GuestFormData, SurveyFormData, DatabaseResult, 
         PertanyaanSurvei, OpsiJawaban, PendidikanTerakhir, Profesi, Admin } from '../../types/database-types';

// Guest Service untuk tabel daftar_tamu
export async function getAllGuests(): Promise<DaftarTamu[]> {
  const query = `
    SELECT * FROM daftar_tamu 
    ORDER BY tanggal_kunjungan DESC, id DESC
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
      profesi, asal_instansi, keperluan, tanggal_kunjungan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
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
      formData.gender || 'Laki-laki',
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
    SELECT js.*, ps.pertanyaan, oa.isi_opsi 
    FROM jawaban_survei js
    LEFT JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
    LEFT JOIN opsi_jawaban oa ON js.pertanyaan_id = oa.pertanyaan_id AND js.jawaban = oa.urutan
    ORDER BY js.created_at DESC
  `;
  return executeQuery<JawabanSurvei[]>(query);
}

// Survey Questions Service
export async function getAllSurveyQuestions(): Promise<PertanyaanSurvei[]> {
  try {
    // Try with is_aktif column first
    const query = 'SELECT * FROM pertanyaan_survei WHERE is_aktif = TRUE ORDER BY id';
    return await executeQuery<PertanyaanSurvei[]>(query);
  } catch (error) {
    // If is_aktif column doesn't exist, get all questions
    const query = 'SELECT * FROM pertanyaan_survei ORDER BY id';
    return await executeQuery<PertanyaanSurvei[]>(query);
  }
}

export async function getSurveyOptions(questionId: number): Promise<OpsiJawaban[]> {
  const query = 'SELECT * FROM opsi_jawaban WHERE pertanyaan_id = ? ORDER BY urutan';
  return executeQuery<OpsiJawaban[]>(query, [questionId]);
}

// Education Service
export async function getAllEducationLevels(): Promise<PendidikanTerakhir[]> {
  const query = 'SELECT * FROM pendidikan_terakhir ORDER BY id';
  return executeQuery<PendidikanTerakhir[]>(query);
}

// Profession Service
export async function getAllProfessions(): Promise<Profesi[]> {
  const query = 'SELECT * FROM profesi ORDER BY nama_profesi';
  return executeQuery<Profesi[]>(query);
}

// Admin Service
export async function getAdminByUsername(username: string): Promise<Admin | null> {
  const query = 'SELECT * FROM admin WHERE username = ?';
  const admins = await executeQuery<Admin[]>(query, [username]);
  return admins.length > 0 ? admins[0] : null;
}

export async function createAdmin(adminData: Partial<Admin>): Promise<number> {
  const query = `
    INSERT INTO admin (username, password, nama_lengkap, email, is_super_admin)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const params = [
    adminData.username,
    adminData.password,
    adminData.nama_lengkap || '',
    adminData.email || '',
    adminData.is_super_admin || false
  ];

  const result = await executeQuery<any>(query, params);
  return result.insertId;
}

// Statistics Service
export async function getGuestStatistics(): Promise<any> {
  const totalGuestsQuery = 'SELECT COUNT(*) as total FROM daftar_tamu';
  const todayGuestsQuery = 'SELECT COUNT(*) as today FROM daftar_tamu WHERE DATE(tanggal_kunjungan) = CURDATE()';
  const thisMonthGuestsQuery = 'SELECT COUNT(*) as thisMonth FROM daftar_tamu WHERE MONTH(tanggal_kunjungan) = MONTH(CURDATE()) AND YEAR(tanggal_kunjungan) = YEAR(CURDATE())';
  const genderStatsQuery = 'SELECT jenis_kelamin, COUNT(*) as count FROM daftar_tamu GROUP BY jenis_kelamin';
  const educationStatsQuery = 'SELECT pendidikan_terakhir, COUNT(*) as count FROM daftar_tamu GROUP BY pendidikan_terakhir ORDER BY count DESC';
  
  const [total, today, thisMonth, gender, education] = await Promise.all([
    executeQuery<any[]>(totalGuestsQuery),
    executeQuery<any[]>(todayGuestsQuery),
    executeQuery<any[]>(thisMonthGuestsQuery),
    executeQuery<any[]>(genderStatsQuery),
    executeQuery<any[]>(educationStatsQuery)
  ]);

  return {
    totalGuests: total[0]?.total || 0,
    todayGuests: today[0]?.today || 0,
    thisMonthGuests: thisMonth[0]?.thisMonth || 0,
    genderStats: gender,
    educationStats: education
  };
}

export async function getSurveyStatistics(): Promise<any> {
  const totalSurveysQuery = 'SELECT COUNT(*) as total FROM jawaban_survei';
  const averageRatingQuery = 'SELECT AVG(jawaban) as average FROM jawaban_survei';
  const ratingDistributionQuery = 'SELECT jawaban, COUNT(*) as count FROM jawaban_survei GROUP BY jawaban ORDER BY jawaban';
  
  const [total, average, distribution] = await Promise.all([
    executeQuery<any[]>(totalSurveysQuery),
    executeQuery<any[]>(averageRatingQuery),
    executeQuery<any[]>(ratingDistributionQuery)
  ]);

  return {
    totalSurveys: total[0]?.total || 0,
    averageRating: parseFloat(average[0]?.average || 0).toFixed(2),
    ratingDistribution: distribution
  };
}
