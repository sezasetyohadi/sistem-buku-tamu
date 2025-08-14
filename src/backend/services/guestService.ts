import { executeQuery } from '../config/db';
import { DaftarTamu, JawabanSurvei, GuestFormData, SurveyFormData, DatabaseResult, 
         PertanyaanSurvei, OpsiJawaban, PendidikanTerakhir, Profesi, Admin } from '../../types/database-types';

// Guest Service untuk tabel daftar_tamu
export async function getAllGuests(): Promise<DaftarTamu[]> {
  const query = `
    SELECT * FROM daftar_tamu 
    ORDER BY id DESC
  `;
  return executeQuery<DaftarTamu[]>(query);
}

export async function getGuestById(id: number): Promise<DaftarTamu | null> {
  const query = 'SELECT * FROM daftar_tamu WHERE id = ?';
  const guests = await executeQuery<DaftarTamu[]>(query, [id]);
  return guests.length > 0 ? guests[0] : null;
}

export async function createGuest(formData: GuestFormData): Promise<number> {
  console.log('Received form data:', formData);

  // Retrieve education and profession labels if IDs are provided
  let pendidikanTerakhir = null;
  let profesi = null;
  
  try {
    // Get education label if ID is provided
    if (formData.pendidikan_terakhir_id) {
      const educationResult = await executeQuery<Array<{ pendidikan_terakhir: string }>>(
        'SELECT pendidikan_terakhir FROM pendidikan_terakhir WHERE id = ?',
        [formData.pendidikan_terakhir_id]
      );
      if (educationResult.length > 0) {
        pendidikanTerakhir = educationResult[0].pendidikan_terakhir;
      }
    }
    
    // Get profession label if ID is provided
    if (formData.profesi_id) {
      const professionResult = await executeQuery<Array<{ nama_profesi: string }>>(
        'SELECT nama_profesi FROM profesi WHERE id = ?',
        [formData.profesi_id]
      );
      if (professionResult.length > 0) {
        profesi = professionResult[0].nama_profesi;
      }
    }
    
    console.log('Resolved education:', pendidikanTerakhir);
    console.log('Resolved profession:', profesi);
    
    // Insert query - Updated to include catatan_tambahan
    const query = `
      INSERT INTO daftar_tamu 
      (nama, email, nomor_telp, alamat, jenis_kelamin, pendidikan_terakhir, 
       profesi, asal_instansi, keperluan, catatan_tambahan, tanggapan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')
    `;
    
    // Parameter dengan catatan tambahan
    const params = [
      formData.nama,
      formData.email,
      formData.nomor_telp || null,
      formData.alamat,
      formData.jenis_kelamin,
      pendidikanTerakhir, // Use resolved education string
      profesi, // Use resolved profession string
      formData.asal_instansi || null,
      formData.keperluan,
      formData.catatan || null // Add catatan_tambahan
    ];

    const result = await executeQuery<any>(query, params);
    const tamuId = result.insertId;
    console.log('Guest inserted with ID:', tamuId);
    
    // Save checkbox answers if provided - fix the logic
    if (formData.cara_memperoleh && Array.isArray(formData.cara_memperoleh) && formData.cara_memperoleh.length > 0) {
      console.log('Saving cara_memperoleh answers:', formData.cara_memperoleh);
      await saveMemperolehInformasiAnswers(tamuId, formData.cara_memperoleh);
    }
    
    if (formData.cara_salinan && Array.isArray(formData.cara_salinan) && formData.cara_salinan.length > 0) {
      console.log('Saving cara_salinan answers:', formData.cara_salinan);
      await saveMendapatkanSalinanAnswers(tamuId, formData.cara_salinan);
    }
    
    return tamuId;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Save answers to jawaban_memperoleh_informasi table
export async function saveMemperolehInformasiAnswers(tamuId: number, answers: number[]): Promise<void> {
  try {
    for (const caraMemperolehId of answers) {
      const query = `
        INSERT INTO jawaban_memperoleh_informasi (tamu_id, cara_memperoleh_id)
        VALUES (?, ?)
      `;
      await executeQuery(query, [tamuId, caraMemperolehId]);
    }
    console.log('Memperoleh informasi answers saved:', answers);
  } catch (error) {
    console.error('Error saving memperoleh informasi answers:', error);
    throw error;
  }
}

// Save answers to jawaban_mendapatkan_salinan table
export async function saveMendapatkanSalinanAnswers(tamuId: number, answers: number[]): Promise<void> {
  try {
    for (const caraSalinanId of answers) {
      const query = `
        INSERT INTO jawaban_mendapatkan_salinan (tamu_id, cara_salinan_id)
        VALUES (?, ?)
      `;
      await executeQuery(query, [tamuId, caraSalinanId]);
    }
    console.log('Mendapatkan salinan answers saved:', answers);
  } catch (error) {
    console.error('Error saving mendapatkan salinan answers:', error);
    throw error;
  }
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
    ORDER BY waktu_dibuat DESC, id DESC
  `;
  
  const searchPattern = `%${searchTerm}%`;
  const params = [searchPattern, searchPattern, searchPattern, searchPattern];
  
  return executeQuery<DaftarTamu[]>(query, params);
}

// Survey Service untuk tabel jawaban_survei
export async function submitSurvey(formData: SurveyFormData): Promise<boolean> {
  try {
    // Based on the actual database structure (jawaban_survei table)
    const query = `
      INSERT INTO jawaban_survei (
        nama_lengkap, email, tanggal_kunjungan, pertanyaan_id, jawaban, saran
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      formData.name,
      formData.email,
      formData.visitDate || new Date().toISOString().split('T')[0],
      1, // default pertanyaan_id
      parseInt(formData.overallRating) || 5,
      formData.feedback || ''
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

// Get Recent Activities for Dashboard (last 24 hours)
export async function getRecentActivities(limit: number = 5): Promise<any[]> {
  const query = `
    SELECT 
      id, 
      nama, 
      asal_instansi, 
      keperluan, 
      tanggapan, 
      waktu_dibuat
    FROM daftar_tamu 
    WHERE waktu_dibuat >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY waktu_dibuat DESC
    LIMIT ?
  `;
  
  return executeQuery<any[]>(query, [limit]);
}

// Statistics Service
export async function getGuestStatistics(): Promise<any> {
  const totalGuestsQuery = 'SELECT COUNT(*) as total FROM daftar_tamu';
  const todayGuestsQuery = 'SELECT COUNT(*) as today FROM daftar_tamu WHERE DATE(waktu_dibuat) = CURDATE()';
  const thisMonthGuestsQuery = 'SELECT COUNT(*) as thisMonth FROM daftar_tamu WHERE MONTH(waktu_dibuat) = MONTH(CURDATE()) AND YEAR(waktu_dibuat) = YEAR(CURDATE())';
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
