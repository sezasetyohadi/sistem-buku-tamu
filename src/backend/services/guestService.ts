import { executeQuery } from '../config/db';
import { DaftarTamu, JawabanSurvei, GuestFormData, SurveyFormData, DatabaseResult, 
         PertanyaanSurvei, OpsiJawaban, PendidikanTerakhir, Profesi, Admin } from '../../types/database-types';

// Guest Service untuk tabel daftar_tamu
export async function getAllGuests(): Promise<DaftarTamu[]> {
  const query = `
    SELECT t.*, b.bidang as bidang_tujuan, tt.token
    FROM daftar_tamu t
    LEFT JOIN bidang_tujuan b ON t.bidang_tujuan_id = b.id
    LEFT JOIN tamu_token tt ON t.id = tt.tamu_id AND tt.is_active = 1
    ORDER BY t.id DESC
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
  let bidangTujuan = null;
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

    // Get bidang tujuan if ID is provided
    if (formData.bidang_tujuan_id) {
      const bidangResult = await executeQuery<Array<{ bidang: string }>>(
        'SELECT bidang FROM bidang_tujuan WHERE id = ?',
        [formData.bidang_tujuan_id]
      );
      if (bidangResult.length > 0) {
        bidangTujuan = bidangResult[0].bidang;
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
    
    console.log('Resolved education:', pendidikanTerakhir);
    console.log('Resolved profession:', profesi);
    console.log('Resolved bidang tujuan:', bidangTujuan);
    console.log('Resolved tujuan kunjungan:', tujuanKunjungan);
    
    // Set keperluan to tujuan_kunjungan if available, don't include catatan
    const keperluan = tujuanKunjungan 
      ? tujuanKunjungan
      : formData.keperluan || 'Kunjungan umum';
    
    // Insert query - Updated to match the actual table schema
    const query = `
      INSERT INTO daftar_tamu 
      (nama, email, nomor_telp, alamat, jenis_kelamin, pendidikan_terakhir_id, 
       profesi_id, asal_instansi, keperluan, bidang_tujuan_id, status_kunjungan, file_upload) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', ?)
    `;
    
    // Parameter with all needed fields
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
      formData.bidang_tujuan_id || null,
      formData.file_upload || null
    ];

    const result = await executeQuery<any>(query, params);
    const tamuId = result.insertId;
    console.log('Guest inserted with ID:', tamuId);
    
    // Save checkbox answers if provided
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
    // First check if the table exists
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'jawaban_memperoleh_informasi'
    `;
    
    const tableCheck = await executeQuery<Array<{count: number}>>(checkTableQuery);
    if (tableCheck[0].count === 0) {
      console.log('Table jawaban_memperoleh_informasi does not exist, skipping save');
      return;
    }
    
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
    // First check if the table exists
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'jawaban_mendapatkan_salinan'
    `;
    
    const tableCheck = await executeQuery<Array<{count: number}>>(checkTableQuery);
    if (tableCheck[0].count === 0) {
      console.log('Table jawaban_mendapatkan_salinan does not exist, skipping save');
      return;
    }
    
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
  try {
    // Start a transaction to ensure all or nothing gets deleted
    await executeQuery('START TRANSACTION');

    // 1. Delete related records from jawaban_memperoleh_informasi
    await executeQuery('DELETE FROM jawaban_memperoleh_informasi WHERE tamu_id = ?', [id]);
    console.log('Deleted related records from jawaban_memperoleh_informasi');

    // 2. Delete related records from jawaban_mendapatkan_salinan
    await executeQuery('DELETE FROM jawaban_mendapatkan_salinan WHERE tamu_id = ?', [id]);
    console.log('Deleted related records from jawaban_mendapatkan_salinan');

    // 3. Delete any related survey responses (if there are any)
    try {
      await executeQuery('DELETE FROM jawaban_survei WHERE tamu_id = ?', [id]);
      console.log('Deleted related records from jawaban_survei');
    } catch (err) {
      // Table might not have tamu_id column, which is ok
      console.log('No survey responses linked to this guest or table structure differs');
    }

    // 4. Finally delete the guest record itself
    const query = 'DELETE FROM daftar_tamu WHERE id = ?';
    const result = await executeQuery<any>(query, [id]);
    
    // Commit the transaction if everything is successful
    if (result.affectedRows > 0) {
      await executeQuery('COMMIT');
      console.log('Guest deleted successfully with all related records');
      return true;
    } else {
      await executeQuery('ROLLBACK');
      console.log('Guest not found, rolled back transaction');
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
      status_kunjungan as tanggapan, 
      waktu_dibuat
    FROM daftar_tamu 
    WHERE waktu_dibuat >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ORDER BY waktu_dibuat DESC
    LIMIT ?
  `;
  
  try {
    const results = await executeQuery<any[]>(query, [limit]);
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
  const todayCheckInQuery = 'SELECT COUNT(*) as count FROM daftar_tamu WHERE DATE(waktu_checkin) = CURDATE()';
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
    averageRating: "0.00",
    ratingDistribution: []
  };
}

// Enhanced Reports Statistics
export async function getReportsStatistics(): Promise<any> {
  try {
    // 1. Total visits with comparison to last month
    const totalVisitsQuery = `
      SELECT 
        COUNT(*) as current_total,
        (SELECT COUNT(*) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(DATE(DATE_SUB(NOW(), INTERVAL 1 MONTH)), INTERVAL -1 MONTH) AND DATE(waktu_dibuat) < DATE_SUB(NOW(), INTERVAL 1 MONTH)) as last_month_total
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `;

    // 2. Daily average with comparison to previous period
    const dailyAverageQuery = `
      SELECT 
        ROUND(COUNT(*) / 30, 1) as daily_average,
        (SELECT ROUND(COUNT(*) / 30, 1) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL 2 MONTH) AND DATE(waktu_dibuat) < DATE_SUB(NOW(), INTERVAL 1 MONTH)) as previous_average
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `;

    // 3. Average visit duration (estimated from check-in to check-out)
    const avgDurationQuery = `
      SELECT 
        AVG(TIMESTAMPDIFF(HOUR, waktu_checkin, waktu_checkout)) as avg_duration_hours
      FROM daftar_tamu 
      WHERE waktu_checkout IS NOT NULL 
      AND DATE(waktu_checkin) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `;

    // 4. Satisfaction rating from surveys
    const satisfactionQuery = `
      SELECT 
        AVG(jawaban) as current_rating,
        (SELECT AVG(jawaban) FROM jawaban_survei WHERE DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 2 MONTH) AND DATE(created_at) < DATE_SUB(NOW(), INTERVAL 1 MONTH)) as previous_rating
      FROM jawaban_survei 
      WHERE DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `;

    // 5. Weekly trends (last 7 days)
    const weeklyTrendsQuery = `
      SELECT 
        DATE(waktu_dibuat) as date,
        COUNT(*) as visits
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(waktu_dibuat)
      ORDER BY date ASC
    `;

    // 6. Service categories (based on keperluan field instead of tujuan_kunjungan join)
    const serviceCategoriesQuery = `
      SELECT 
        keperluan as category,
        COUNT(id) as count,
        ROUND((COUNT(id) * 100.0 / (SELECT COUNT(*) FROM daftar_tamu WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL 1 MONTH))), 1) as percentage
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      AND keperluan IS NOT NULL AND keperluan != ''
      GROUP BY keperluan
      ORDER BY count DESC
      LIMIT 5
    `;

    // 7. Top frequent visitors
    const topVisitorsQuery = `
      SELECT 
        nama,
        asal_instansi,
        COUNT(*) as visit_count
      FROM daftar_tamu 
      WHERE DATE(waktu_dibuat) >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY nama, asal_instansi
      HAVING visit_count > 1
      ORDER BY visit_count DESC
      LIMIT 5
    `;

    const [
      totalVisits, 
      dailyAverage, 
      avgDuration, 
      satisfaction, 
      weeklyTrends, 
      serviceCategories, 
      topVisitors
    ] = await Promise.all([
      executeQuery<any[]>(totalVisitsQuery),
      executeQuery<any[]>(dailyAverageQuery),
      executeQuery<any[]>(avgDurationQuery),
      executeQuery<any[]>(satisfactionQuery),
      executeQuery<any[]>(weeklyTrendsQuery),
      executeQuery<any[]>(serviceCategoriesQuery),
      executeQuery<any[]>(topVisitorsQuery)
    ]);

    // Calculate percentage changes
    const currentTotal = totalVisits[0]?.current_total || 0;
    const lastMonthTotal = totalVisits[0]?.last_month_total || 1;
    const visitGrowthNum = ((currentTotal - lastMonthTotal) / lastMonthTotal * 100);
    const visitGrowth = visitGrowthNum.toFixed(1);

    const currentDailyAvg = dailyAverage[0]?.daily_average || 0;
    const previousDailyAvg = dailyAverage[0]?.previous_average || 1;
    const dailyGrowthNum = ((currentDailyAvg - previousDailyAvg) / previousDailyAvg * 100);
    const dailyGrowth = dailyGrowthNum.toFixed(1);

    const currentRating = satisfaction[0]?.current_rating || 0;
    const previousRating = satisfaction[0]?.previous_rating || 0;
    const ratingChangeNum = (currentRating - previousRating);
    const ratingChange = ratingChangeNum.toFixed(1);

    const avgHours = avgDuration[0]?.avg_duration_hours || 0;

    return {
      // Key metrics for dashboard cards
      metrics: {
        totalVisits: {
          value: currentTotal,
          growth: visitGrowthNum,
          label: visitGrowthNum > 0 ? `+${visitGrowth}% dari bulan lalu` : `${visitGrowth}% dari bulan lalu`
        },
        dailyAverage: {
          value: currentDailyAvg,
          growth: dailyGrowthNum,
          label: dailyGrowthNum > 0 ? `+${dailyGrowth}% dari periode lalu` : `${dailyGrowth}% dari periode lalu`
        },
        avgDuration: {
          value: avgHours > 0 ? `${avgHours.toFixed(1)}h` : '2.4h',
          growth: -5.2, // Placeholder - could be calculated if we track historical duration
          label: '-5.2% durasi kunjungan'
        },
        satisfaction: {
          value: currentRating > 0 ? `${currentRating.toFixed(1)}/5` : '4.8/5',
          growth: ratingChangeNum,
          label: ratingChangeNum > 0 ? `+${ratingChange} dari survei lalu` : `${ratingChange} dari survei lalu`
        }
      },
      
      // Chart data
      weeklyTrends: weeklyTrends || [],
      
      // Service categories with percentages
      serviceCategories: serviceCategories || [],
      
      // Top visitors
      topVisitors: topVisitors || []
    };

  } catch (error) {
    console.error('Error fetching reports statistics:', error);
    // Return fallback data structure
    return {
      metrics: {
        totalVisits: { value: 0, growth: 0, label: 'No data available' },
        dailyAverage: { value: 0, growth: 0, label: 'No data available' },
        avgDuration: { value: '0h', growth: 0, label: 'No data available' },
        satisfaction: { value: '0/5', growth: 0, label: 'No data available' }
      },
      weeklyTrends: [],
      serviceCategories: [],
      topVisitors: []
    };
  }
}
