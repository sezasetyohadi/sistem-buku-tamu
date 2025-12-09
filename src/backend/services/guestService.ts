import { guestLogger, dbLogger, safeLog } from '../../lib/logger';
import { DaftarTamu, JawabanSurvei, GuestFormData, SurveyFormData, DatabaseResult, 
         PertanyaanSurvei, OpsiJawaban, PendidikanTerakhir, Profesi, Admin } from '../../types/database-types';
import { executeQuery } from '../config/db';

// Guest Service untuk tabel daftar_tamu
export async function getAllGuests(): Promise<DaftarTamu[]> {
  const query = `
    SELECT t.*, 
           pt.pendidikan_terakhir,
           p.nama_profesi as profesi,
           bt.bidang as bidang_tujuan,
           tt.token
    FROM daftar_tamu t
    LEFT JOIN pendidikan_terakhir pt ON t.pendidikan_terakhir_id = pt.id
    LEFT JOIN profesi p ON t.profesi_id = p.id
    LEFT JOIN bidang_tujuan bt ON t.bidang_tujuan_id = bt.id
    LEFT JOIN tamu_token tt ON t.id = tt.tamu_id AND tt.is_active = 1
    ORDER BY t.id DESC
  `;
  return executeQuery<DaftarTamu[]>(query);
}

export async function getGuestById(id: number): Promise<DaftarTamu | null> {
  const query = `
    SELECT t.*, 
           pt.pendidikan_terakhir,
           p.nama_profesi as profesi,
           bt.bidang as bidang_tujuan
    FROM daftar_tamu t
    LEFT JOIN pendidikan_terakhir pt ON t.pendidikan_terakhir_id = pt.id
    LEFT JOIN profesi p ON t.profesi_id = p.id
    LEFT JOIN bidang_tujuan bt ON t.bidang_tujuan_id = bt.id
    WHERE t.id = ?
  `;
  const guests = await executeQuery<DaftarTamu[]>(query, [id]);
  return guests.length > 0 ? guests[0] : null;
}

export async function createGuest(formData: GuestFormData): Promise<number> {
  safeLog.sensitive('Received form data', formData);

  // Retrieve education and profession labels if IDs are provided
  let pendidikanTerakhir = null;
  let profesi = null;
  let tujuanKunjungan = null;
  
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

    // Get tujuan kunjungan if ID is provided
    if (formData.tujuan_kunjungan_id) {
      const tujuanResult = await executeQuery<Array<{ tujuan: string }>>(
        'SELECT tujuan FROM tujuan_kunjungan WHERE id = ?',
        [formData.tujuan_kunjungan_id]
      );
      if (tujuanResult.length > 0) {
        tujuanKunjungan = tujuanResult[0].tujuan;
      }
    }
    
    guestLogger.debug('Resolved education:', pendidikanTerakhir);
    guestLogger.debug('Resolved profession:', profesi);
    guestLogger.debug('Resolved tujuan kunjungan:', tujuanKunjungan);
    
    // Set keperluan to tujuan_kunjungan if available, don't include catatan
    const keperluan = tujuanKunjungan 
      ? tujuanKunjungan
      : formData.keperluan || 'Kunjungan umum';
    
    // Insert query - Updated to match the actual table schema and include catatan_tambahan
    const query = `
      INSERT INTO daftar_tamu 
      (nama, email, nomor_telp, alamat, jenis_kelamin, pendidikan_terakhir_id, 
       profesi_id, asal_instansi, keperluan, catatan_tambahan, status_kunjungan, file_upload, file_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', ?, ?)
    `;
    
    // Parameter with all needed fields including catatan_tambahan
    const params = [
      formData.nama,
      formData.email,
      formData.nomor_telp || null,
      formData.alamat,
      formData.jenis_kelamin,
      formData.pendidikan_terakhir_id || null, // Use the ID directly
      formData.profesi_id || null, // Use the ID directly
      formData.asal_instansi || null,
      keperluan,
      formData.catatan || null, // Save notes to catatan_tambahan column
      formData.file_upload || null,
      formData.file_name || null // Add original filename
    ];

    const result = await executeQuery<any>(query, params);
    const tamuId = result.insertId;
    guestLogger.info('Guest inserted with ID:', tamuId);
    
    // Save checkbox answers if provided
    if (formData.cara_memperoleh && Array.isArray(formData.cara_memperoleh) && formData.cara_memperoleh.length > 0) {
      guestLogger.debug('Saving cara_memperoleh answers:', formData.cara_memperoleh);
      await saveMemperolehInformasiAnswers(tamuId, formData.cara_memperoleh);
    }
    
    if (formData.cara_salinan && Array.isArray(formData.cara_salinan) && formData.cara_salinan.length > 0) {
      guestLogger.debug('Saving cara_salinan answers:', formData.cara_salinan);
      await saveMendapatkanSalinanAnswers(tamuId, formData.cara_salinan);
    }
    
    return tamuId;
  } catch (error) {
    dbLogger.error('Database error:', error);
    throw error;
  }
}

// Save answers to jawaban_memperoleh_informasi table
export async function saveMemperolehInformasiAnswers(tamuId: number, answers: number[]): Promise<void> {
  try {
    // First check if the table exists
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'jawaban_memperoleh_informasi'
    `;
    
    const tableCheck = await executeQuery<Array<{count: number}>>(checkTableQuery);
    if (tableCheck[0].count === 0) {
      guestLogger.debug('Table jawaban_memperoleh_informasi does not exist, skipping save');
      return;
    }
    
    for (const caraMemperolehId of answers) {
      const query = `
        INSERT INTO jawaban_memperoleh_informasi (tamu_id, cara_memperoleh_id)
        VALUES (?, ?)
      `;
      await executeQuery(query, [tamuId, caraMemperolehId]);
    }
    guestLogger.debug('Memperoleh informasi answers saved:', answers);
  } catch (error) {
    guestLogger.error('Error saving memperoleh informasi answers:', error);
    throw error;
  }
}

// Save answers to jawaban_mendapatkan_salinan table
export async function saveMendapatkanSalinanAnswers(tamuId: number, answers: number[]): Promise<void> {
  try {
    // First check if the table exists
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'jawaban_mendapatkan_salinan'
    `;
    
    const tableCheck = await executeQuery<Array<{count: number}>>(checkTableQuery);
    if (tableCheck[0].count === 0) {
      guestLogger.debug('Table jawaban_mendapatkan_salinan does not exist, skipping save');
      return;
    }
    
    for (const caraSalinanId of answers) {
      const query = `
        INSERT INTO jawaban_mendapatkan_salinan (tamu_id, cara_salinan_id)
        VALUES (?, ?)
      `;
      await executeQuery(query, [tamuId, caraSalinanId]);
    }
    guestLogger.debug('Mendapatkan salinan answers saved:', answers);
  } catch (error) {
    guestLogger.error('Error saving mendapatkan salinan answers:', error);
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
  try {
    // Start a transaction to ensure all or nothing gets deleted
    await executeQuery('START TRANSACTION');

    // 1. Delete related records from jawaban_memperoleh_informasi
    await executeQuery('DELETE FROM jawaban_memperoleh_informasi WHERE tamu_id = ?', [id]);
    //console.log('Deleted related records from jawaban_memperoleh_informasi');

    // 2. Delete related records from jawaban_mendapatkan_salinan
    await executeQuery('DELETE FROM jawaban_mendapatkan_salinan WHERE tamu_id = ?', [id]);
    //console.log('Deleted related records from jawaban_mendapatkan_salinan');

    // 3. Delete any related survey responses (if there are any)
    try {
      await executeQuery('DELETE FROM jawaban_survei WHERE tamu_id = ?', [id]);
      //console.log('Deleted related records from jawaban_survei');
    } catch (err) {
      // Table might not have tamu_id column, which is ok
      //console.log('No survey responses linked to this guest or table structure differs');
    }

    // 4. Finally delete the guest record itself
    const query = 'DELETE FROM daftar_tamu WHERE id = ?';
    const result = await executeQuery<any>(query, [id]);
    
    // Commit the transaction if everything is successful
    if (result.affectedRows > 0) {
      await executeQuery('COMMIT');
      //console.log('Guest deleted successfully with all related records');
      return true;
    } else {
      await executeQuery('ROLLBACK');
      //console.log('Guest not found, rolled back transaction');
      return false;
    }
  } catch (error) {
    // If any error occurs, roll back the transaction
    await executeQuery('ROLLBACK');
    console.error('Error deleting guest and related records:', error);
    throw error;
  }
}

export async function searchGuests(searchTerm: string): Promise<DaftarTamu[]> {
  const query = `
    SELECT t.*, 
           pt.pendidikan_terakhir,
           p.nama_profesi as profesi,
           tt.token
    FROM daftar_tamu t
    LEFT JOIN pendidikan_terakhir pt ON t.pendidikan_terakhir_id = pt.id
    LEFT JOIN profesi p ON t.profesi_id = p.id
    LEFT JOIN tamu_token tt ON t.id = tt.tamu_id AND tt.is_active = 1
    WHERE t.nama LIKE ? 
       OR t.email LIKE ? 
       OR t.asal_instansi LIKE ? 
       OR t.keperluan LIKE ?
       OR pt.pendidikan_terakhir LIKE ?
       OR p.nama_profesi LIKE ?
    ORDER BY t.waktu_dibuat DESC, t.id DESC
  `;
  
  const searchPattern = `%${searchTerm}%`;
  const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
  
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
    INSERT INTO admin (username, password, nama_lengkap, email, bidang_tujuan_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const params = [
    adminData.username,
    adminData.password,
    adminData.nama_lengkap || '',
    adminData.email || '',
    adminData.bidang_tujuan_id || 999
  ];

  const result = await executeQuery<any>(query, params);
  return result.insertId;
}

// Get Recent Activities for Dashboard (configurable period)
export async function getRecentActivities(limit: number = 5, periodDays: number = 1, bidangTujuanId?: number): Promise<any[]> {
  // Add department filter if bidangTujuanId is provided
  const departmentFilter = bidangTujuanId ? 'AND bidang_tujuan_id = ?' : '';
  
  const query = `
    SELECT 
      id, 
      nama, 
      asal_instansi, 
      keperluan, 
      status_kunjungan as tanggapan, 
      waktu_dibuat
    FROM daftar_tamu 
    WHERE waktu_dibuat >= DATE_SUB(NOW(), INTERVAL ${periodDays} DAY)
    ${departmentFilter}
    ORDER BY waktu_dibuat DESC
    LIMIT ?
  `;
  
  try {
    // Add bidangTujuanId to params if it's defined
    const params = bidangTujuanId ? [bidangTujuanId, limit] : [limit];
    const results = await executeQuery<any[]>(query, params);
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

// Statistics Service
export async function getGuestStatistics(): Promise<any> {
  // Basic guest statistics
  const totalGuestsQuery = 'SELECT COUNT(*) as total FROM daftar_tamu';
  const todayGuestsQuery = 'SELECT COUNT(*) as today FROM daftar_tamu WHERE DATE(waktu_dibuat) = CURDATE()';
  const thisMonthGuestsQuery = 'SELECT COUNT(*) as thisMonth FROM daftar_tamu WHERE MONTH(waktu_dibuat) = MONTH(CURDATE()) AND YEAR(waktu_dibuat) = YEAR(CURDATE())';
  
  // Dashboard statistics for admin
  const todayCheckInQuery = 'SELECT COUNT(*) as count FROM daftar_tamu WHERE status_kunjungan = "Terjadwal" AND DATE(jadwal_checkin) = CURDATE()';
  const todayCheckOutQuery = 'SELECT COUNT(*) as count FROM daftar_tamu WHERE DATE(waktu_checkout) = CURDATE()';
  const currentlyVisitingQuery = 'SELECT COUNT(*) as count FROM daftar_tamu WHERE status_kunjungan = "Datang" AND DATE(waktu_checkin) = CURDATE() AND waktu_checkout IS NULL';
  
  // Demographic statistics
  const genderStatsQuery = 'SELECT jenis_kelamin, COUNT(*) as count FROM daftar_tamu GROUP BY jenis_kelamin';
  const educationStatsQuery = `
    SELECT pt.pendidikan_terakhir, COUNT(*) as count 
    FROM daftar_tamu dt 
    LEFT JOIN pendidikan_terakhir pt ON dt.pendidikan_terakhir_id = pt.id 
    GROUP BY pt.pendidikan_terakhir 
    ORDER BY count DESC
  `;
  
  const [total, today, thisMonth, todayCheckIn, todayCheckOut, currentlyVisiting, gender, education] = await Promise.all([
    executeQuery<any[]>(totalGuestsQuery),
    executeQuery<any[]>(todayGuestsQuery),
    executeQuery<any[]>(thisMonthGuestsQuery),
    executeQuery<any[]>(todayCheckInQuery),
    executeQuery<any[]>(todayCheckOutQuery),
    executeQuery<any[]>(currentlyVisitingQuery),
    executeQuery<any[]>(genderStatsQuery),
    executeQuery<any[]>(educationStatsQuery)
  ]);

  return {
    // Total counts
    totalGuests: total[0]?.total || 0,
    todayGuests: today[0]?.today || 0,
    thisMonthGuests: thisMonth[0]?.thisMonth || 0,
    
    // Dashboard metrics for admin
    todayCheckIn: todayCheckIn[0]?.count || 0,
    todayCheckOut: todayCheckOut[0]?.count || 0,
    currentlyVisiting: currentlyVisiting[0]?.count || 0,
    
    // Demographic stats
    genderStats: gender,
    educationStats: education
  };
}

export async function getSurveyStatistics(): Promise<any> {
  const totalSurveysQuery = 'SELECT COUNT(*) as total FROM jawaban_identitas_survei';
  
  // For now, we'll return default values for average rating and distribution
  // since we need to properly implement the new schema
  const total = await executeQuery<any[]>(totalSurveysQuery);
  
  return {
    totalSurveys: total[0]?.total || 0,
    averageRating: '0.00',
    ratingDistribution: []
  };
}

// Enhanced Reports Statistics
export async function getReportsStatistics(periodDays: number = 7, bidangTujuanId?: number): Promise<any> {
  try {
    //console.log('getReportsStatistics called with:', { periodDays, bidangTujuanId });
    
    // Department filter condition and parameters
    const deptFilter = bidangTujuanId ? 'AND bidang_tujuan_id = ?' : '';
    const deptParams = bidangTujuanId ? [bidangTujuanId] : [];
    
    //console.log('Department filter:', { deptFilter, deptParams });
    
    // 1. Total visits for current period vs previous period
    const totalVisitsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}) as current_total,
        (SELECT COUNT(*) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) AND DATE(waktu_dibuat) < DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}) as previous_total
    `;
    const totalVisitsParams = bidangTujuanId ? [periodDays, ...deptParams, periodDays * 2, periodDays, ...deptParams] : [periodDays, periodDays * 2, periodDays];

    // 2. Daily average visitors (total registered guests / period days)
    const dailyAverageQuery = `
      SELECT 
        ROUND(COUNT(*) / ?, 1) as daily_average,
        (SELECT ROUND(COUNT(*) / ?, 1) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) AND DATE(waktu_dibuat) < DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}) as previous_average
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}
    `;
    const dailyAverageParams = bidangTujuanId ? [periodDays, periodDays, periodDays * 2, periodDays, ...deptParams, periodDays, ...deptParams] : [periodDays, periodDays, periodDays * 2, periodDays, periodDays];

    // 3. Average visit duration (check-in to check-out time)
    const avgDurationQuery = `
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, waktu_checkin, waktu_checkout)) as avg_duration_minutes,
        (SELECT AVG(TIMESTAMPDIFF(MINUTE, waktu_checkin, waktu_checkout)) FROM daftar_tamu WHERE waktu_checkout IS NOT NULL AND DATE(waktu_checkin) >= DATE_SUB(NOW(), INTERVAL ? DAY) AND DATE(waktu_checkin) < DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}) as previous_avg_duration
      FROM daftar_tamu 
      WHERE waktu_checkout IS NOT NULL 
      AND DATE(waktu_checkin) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}
    `;
    const avgDurationParams = bidangTujuanId ? [periodDays * 2, periodDays, ...deptParams, periodDays, ...deptParams] : [periodDays * 2, periodDays, periodDays];

    // 4. Satisfaction rating from surveys (average urutan_rating, max 4)
    // Note: Survey data is independent and doesn't link to bidang_tujuan_id
    // So we'll get overall satisfaction regardless of department for now
    const satisfactionQuery = `
      SELECT 
        AVG(or_current.urutan_rating) as current_rating,
        COUNT(*) as total_responses,
        (SELECT AVG(or_prev.urutan_rating) 
         FROM jawaban_survei js_prev 
         LEFT JOIN opsi_rating or_prev ON js_prev.jawaban = or_prev.id 
         WHERE DATE(js_prev.created_at) >= DATE_SUB(NOW(), INTERVAL ? DAY) 
         AND DATE(js_prev.created_at) < DATE_SUB(NOW(), INTERVAL ? DAY)) as previous_rating
      FROM jawaban_survei js_current
      LEFT JOIN opsi_rating or_current ON js_current.jawaban = or_current.id
      WHERE DATE(js_current.created_at) >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    const satisfactionParams = [periodDays * 2, periodDays, periodDays];

    // 5. Trends (visits per day for the period)
    const trendsQuery = `
      SELECT 
        DATE(waktu_dibuat) as date,
        COUNT(*) as visits
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}
      GROUP BY DATE(waktu_dibuat)
      ORDER BY date ASC
    `;
    const trendsParams = bidangTujuanId ? [periodDays, bidangTujuanId] : [periodDays];

    // 6. Service categories (based on keperluan field)
    const serviceCategoriesQuery = `
      SELECT 
        keperluan as category,
        COUNT(id) as count,
        ROUND((COUNT(id) * 100.0 / (SELECT COUNT(*) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter})), 1) as percentage
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}
      AND keperluan IS NOT NULL AND keperluan != ''
      GROUP BY keperluan
      ORDER BY count DESC
      LIMIT 5
    `;
    const serviceCategoriesParams = bidangTujuanId ? [periodDays, bidangTujuanId, periodDays, bidangTujuanId] : [periodDays, periodDays];

    // 7. Top frequent visitors within period (based on unique email with status "Datang" or "Selesai")
    const topVisitorsQuery = `
      SELECT 
        dt.nama,
        dt.asal_instansi,
        COUNT(DISTINCT dt.email) as visit_count,
        dt.email
      FROM daftar_tamu dt
      WHERE DATE(dt.waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY)
      AND dt.status_kunjungan IN ('Datang', 'Selesai')
      AND dt.email IS NOT NULL
      ${deptFilter}
      GROUP BY dt.email, dt.nama, dt.asal_instansi
      ORDER BY visit_count DESC, dt.waktu_dibuat DESC
      LIMIT 5
    `;
    const topVisitorsParams = bidangTujuanId ? [Math.max(periodDays, 30), bidangTujuanId] : [Math.max(periodDays, 30)];

    // 8. Layanan Diberikan statistics (layanan_disnaker_id aggregation)
    const layananDiberikanQuery = `
      SELECT 
        COALESCE(ld.nama_layanan, 'Belum terdata') as layanan_name,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter})), 1) as percentage
      FROM daftar_tamu dt
      LEFT JOIN layanan_disnaker ld ON dt.layanan_disnaker_id = ld.id
      WHERE DATE(dt.waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY) ${deptFilter}
      GROUP BY dt.layanan_disnaker_id, ld.nama_layanan
      ORDER BY count DESC
    `;
    const layananDiberikanParams = bidangTujuanId ? [periodDays, bidangTujuanId, periodDays, bidangTujuanId] : [periodDays, periodDays];

    // 9. Bidang Tujuan statistics (most visited departments) - no department filter (show all)
    const bidangTujuanQuery = `
      SELECT 
        bt.bidang as bidang_name,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY))), 1) as percentage
      FROM daftar_tamu dt
      LEFT JOIN bidang_tujuan bt ON dt.bidang_tujuan_id = bt.id
      WHERE DATE(dt.waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY dt.bidang_tujuan_id, bt.bidang
      ORDER BY count DESC
    `;
    const bidangTujuanParams = [periodDays, periodDays];

    console.log('Executing queries with bidang_tujuan_id:', bidangTujuanId);
    console.log('layananDiberikanParams:', layananDiberikanParams);
    console.log('bidangTujuanParams:', bidangTujuanParams);
    
    const [
      totalVisitsData, 
      dailyAverageData, 
      avgDurationData, 
      satisfactionData, 
      trendsData, 
      serviceCategoriesData, 
      topVisitorsData,
      layananDiberikanData,
      bidangTujuanData
    ] = await Promise.all([
      executeQuery<any[]>(totalVisitsQuery, totalVisitsParams),
      executeQuery<any[]>(dailyAverageQuery, dailyAverageParams),
      executeQuery<any[]>(avgDurationQuery, avgDurationParams),
      executeQuery<any[]>(satisfactionQuery, satisfactionParams),
      executeQuery<any[]>(trendsQuery, trendsParams),
      executeQuery<any[]>(serviceCategoriesQuery, serviceCategoriesParams),
      executeQuery<any[]>(topVisitorsQuery, topVisitorsParams),
      executeQuery<any[]>(layananDiberikanQuery, layananDiberikanParams),
      executeQuery<any[]>(bidangTujuanQuery, bidangTujuanParams)
    ]);

    console.log('Query results:');
    console.log('- layananDiberikanData:', layananDiberikanData);
    console.log('- bidangTujuanData:', bidangTujuanData);
    console.log('- serviceCategoriesData:', serviceCategoriesData);
    console.log('- topVisitorsData:', topVisitorsData);

    // Debug logging to understand data types
    /* console.log('Raw data from queries:', {
      totalVisits: totalVisitsData[0],
      dailyAverage: dailyAverageData[0],
      avgDuration: avgDurationData[0],
      satisfaction: satisfactionData[0],
      trends: trendsData,
      serviceCategories: serviceCategoriesData,
      topVisitors: topVisitorsData
    }); */
    
    /* console.log('Query parameters used:', {
      totalVisitsParams,
      dailyAverageParams,
      avgDurationParams,
      satisfactionParams,
      trendsParams,
      serviceCategoriesParams,
      topVisitorsParams
    }); */

    // Calculate percentage changes - ensure proper number conversion
    const currentTotal = parseInt(totalVisitsData[0]?.current_total) || 0;
    const previousTotal = parseInt(totalVisitsData[0]?.previous_total) || 1;
    const visitGrowthNum = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;
    const visitGrowthLabel = visitGrowthNum.toFixed(1);

    const currentDailyAvg = parseFloat(dailyAverageData[0]?.daily_average) || 0;
    const previousDailyAvg = parseFloat(dailyAverageData[0]?.previous_average) || 1;
    const dailyGrowthNum = previousDailyAvg > 0 ? ((currentDailyAvg - previousDailyAvg) / previousDailyAvg * 100) : 0;
    const dailyGrowthLabel = dailyGrowthNum.toFixed(1);

    // Duration formatting (minutes to hours and minutes) - ensure proper number conversion
    const avgMinutes = parseFloat(avgDurationData[0]?.avg_duration_minutes) || 0;
    const previousAvgMinutes = parseFloat(avgDurationData[0]?.previous_avg_duration) || 0;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = Math.round(avgMinutes % 60);
    const durationValue = avgMinutes > 0 ? `${avgHours}h ${avgMins}m` : '0h';
    
    const durationGrowthNum = previousAvgMinutes > 0 ? ((avgMinutes - previousAvgMinutes) / previousAvgMinutes * 100) : 0;
    const durationGrowthLabel = durationGrowthNum.toFixed(1);

    // Satisfaction rating - convert 4-point scale to 10-point scale (each choice = 2.5 points)
    const currentRating = parseFloat(satisfactionData[0]?.current_rating) || 0;
    const previousRating = parseFloat(satisfactionData[0]?.previous_rating) || 0;
    const totalResponses = parseInt(satisfactionData[0]?.total_responses) || 0;
    
    // Convert 4-point scale to 10-point scale (multiply by 2.5)
    const currentRating10 = currentRating * 2.5;
    const previousRating10 = previousRating * 2.5;
    const ratingChangeNum = previousRating > 0 ? (currentRating10 - previousRating10) : 0;
    const ratingChangeLabel = ratingChangeNum.toFixed(1);
    const satisfactionValue = currentRating > 0 ? `${Math.round(currentRating10)}/10` : '0/10';

    return {
      // Key metrics for dashboard cards
      metrics: {
        totalVisits: {
          value: currentTotal,
          growth: visitGrowthNum,
          label: visitGrowthNum > 0 ? `+${visitGrowthLabel}% dari periode sebelumnya` : `${visitGrowthLabel}% dari periode sebelumnya`
        },
        dailyAverage: {
          value: currentDailyAvg,
          growth: dailyGrowthNum,
          label: dailyGrowthNum > 0 ? `+${dailyGrowthLabel}% dari periode sebelumnya` : `${dailyGrowthLabel}% dari periode sebelumnya`
        },
        avgDuration: {
          value: durationValue,
          growth: durationGrowthNum,
          label: durationGrowthNum > 0 ? `+${durationGrowthLabel}% durasi kunjungan` : `${durationGrowthLabel}% durasi kunjungan`
        },
        satisfaction: {
          value: satisfactionValue,
          growth: ratingChangeNum,
          label: totalResponses > 0 ? (ratingChangeNum > 0 ? `+${ratingChangeLabel} dari periode sebelumnya` : `${ratingChangeLabel} dari periode sebelumnya`) : 'Belum ada data survei'
        }
      },
      
      // Chart data
      weeklyTrends: trendsData || [],
      
      // Service categories with percentages (Permintaan Layanan)
      serviceCategories: serviceCategoriesData || [],
      
      // Layanan Diberikan statistics
      layananDiberikan: layananDiberikanData || [],
      
      // Bidang Tujuan statistics (most visited departments)
      bidangTujuan: bidangTujuanData || [],
      
      // Top visitors
      topVisitors: topVisitorsData || [],
      
      // Filter information
      filterInfo: {
        filteredByDepartment: !!bidangTujuanId,
        departmentId: bidangTujuanId || null
      }
    };

  } catch (error) {
    console.error('Error fetching reports statistics:', error);
    // Return fallback data structure
    return {
      metrics: {
        totalVisits: { value: 0, growth: 0, label: 'No data available' },
        dailyAverage: { value: 0, growth: 0, label: 'No data available' },
        avgDuration: { value: '0h', growth: 0, label: 'No data available' },
        satisfaction: { value: '0/10', growth: 0, label: 'No data available' }
      },
      weeklyTrends: [],
      serviceCategories: [],
      layananDiberikan: [],
      bidangTujuan: [],
      topVisitors: [],
      filterInfo: {
        filteredByDepartment: !!bidangTujuanId,
        departmentId: bidangTujuanId || null
      }
    };
  }
}

/**
 * Find a guest by email address
 */
export async function findGuestByEmail(email: string): Promise<DaftarTamu | null> {
  try {
    const query = `
      SELECT t.*, 
             pt.pendidikan_terakhir,
             p.nama_profesi as profesi,
             bt.bidang as bidang_tujuan
      FROM daftar_tamu t
      LEFT JOIN pendidikan_terakhir pt ON t.pendidikan_terakhir_id = pt.id
      LEFT JOIN profesi p ON t.profesi_id = p.id
      LEFT JOIN bidang_tujuan bt ON t.bidang_tujuan_id = bt.id
      WHERE t.email = ?
      ORDER BY t.id DESC
      LIMIT 1
    `;
    
    const result = await executeQuery<DaftarTamu[]>(query, [email]);
    
    if (result.length > 0) {
      return result[0];
    }
    
    return null;
  } catch (error) {
    guestLogger.error('Error finding guest by email:', error);
    throw error;
  }
}

/**
 * Check if a guest has already submitted a survey based on their ID
 */
export async function checkIfSurveySubmitted(tamuId: number): Promise<boolean> {
  if (!tamuId) {
    return false;
  }
  
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM jawaban_identitas_survei
      WHERE tamu_id = ?
    `;
    
    const result = await executeQuery<Array<{count: number}>>(query, [tamuId]);
    
    // If count > 0, survey has been submitted
    return result[0]?.count > 0;
  } catch (error) {
    guestLogger.error('Error checking if survey submitted:', error);
    return false;
  }
}

/**
 * Gets guest data by ID to use for autofilling survey identity form
 */
export async function getGuestDataForSurvey(tamuId: number): Promise<any> {
  try {
    const query = `
      SELECT 
        t.id,
        t.nama,
        t.email,
        t.nomor_telp,
        t.alamat,
        t.jenis_kelamin,
        t.pendidikan_terakhir_id,
        pt.pendidikan_terakhir,
        t.profesi_id,
        p.nama_profesi,
        t.keperluan
      FROM daftar_tamu t
      LEFT JOIN pendidikan_terakhir pt ON t.pendidikan_terakhir_id = pt.id
      LEFT JOIN profesi p ON t.profesi_id = p.id
      WHERE t.id = ?
    `;
    
    const result = await executeQuery<any[]>(query, [tamuId]);
    
    if (result.length > 0) {
      return result[0];
    }
    
    return null;
  } catch (error) {
    guestLogger.error('Error getting guest data for survey:', error);
    throw error;
  }
}
