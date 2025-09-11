// Define interfaces for survey-related types
// Section interface removed as it's no longer used

export interface SurveyQuestion {
  id: number;
  baris: number;
  pertanyaan: string;
  is_aktif: boolean;
  created_at: string;
  jenis_rating_id?: number; // This will not be stored directly in pertanyaan_survei but in pertanyaan_s_jenis_rating
  is_required?: boolean;
}

export interface RatingType {
  id: number;
  nama_rating: string;
}

export interface RatingOption {
  id: number;
  jenis_rating_id: number;
  skala_rating: string;
  urutan_rating: number;
}

export interface SurveyAnswer {
  id?: number;
  nama_lengkap: string;
  email: string;
  tanggal_kunjungan: string;
  pertanyaan_id: number;
  jawaban: number | string;
  created_at?: string;
  saran?: string;
}

// SQL queries for survey functionality
export const SURVEY_QUERIES = {
  // Get all questions organized by rows and columns (including inactive)
  GET_ALL_QUESTIONS_BY_LAYOUT: `
    SELECT 
      ps.id, ps.baris, ps.pertanyaan, 
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, ps.is_required, pjr.jenis_rating_id,
      pjr.urutan
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    ORDER BY ps.baris
  `,
  
  // Get all questions (both active and inactive)
  GET_ALL_QUESTIONS: `
    SELECT 
      ps.id, ps.baris, ps.pertanyaan, 
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, ps.is_required, pjr.jenis_rating_id,
      pjr.urutan
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    ORDER BY ps.baris
  `,
  
  // Get only active questions for guest pages
  GET_ACTIVE_QUESTIONS: `
    SELECT 
      ps.id, ps.baris, ps.pertanyaan, 
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, ps.is_required, pjr.jenis_rating_id,
      pjr.urutan
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    WHERE ps.is_aktif = 1
    ORDER BY ps.baris
  `,
  
  // Get a specific question by ID
  GET_QUESTION_BY_ID: `
    SELECT 
      ps.id, ps.baris, ps.pertanyaan, 
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, ps.is_required, pjr.jenis_rating_id,
      pjr.urutan
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    WHERE ps.id = ?
  `,
  
  // Get max row to determine where to add new questions
  GET_MAX_ROW: `
    SELECT COALESCE(MAX(baris), 0) as max_baris
    FROM pertanyaan_survei
  `,
  
  // Get all rating types (with optional type filter)
  GET_ALL_RATING_TYPES: `
    SELECT id, nama_rating
    FROM jenis_rating
    ORDER BY id
  `,
  
  // Get rating types by type (rating or text) - tipe column no longer exists
  GET_RATING_TYPES_BY_TYPE: `
    SELECT id, nama_rating
    FROM jenis_rating
    ORDER BY id
  `,
  
  // Get rating options by type
  GET_RATING_OPTIONS_BY_TYPE: `
    SELECT id, jenis_rating_id, skala_rating, urutan_rating
    FROM opsi_rating
    WHERE jenis_rating_id = ?
    ORDER BY urutan_rating
  `,
  
  // Get all rating options
  GET_ALL_RATING_OPTIONS: `
    SELECT id, jenis_rating_id, skala_rating, urutan_rating
    FROM opsi_rating
    ORDER BY jenis_rating_id, urutan_rating
  `,
  
  // Submit a survey answer
  SUBMIT_ANSWER: `
    INSERT INTO jawaban_survei 
    (nama_lengkap, email, tanggal_kunjungan, pertanyaan_id, jawaban, saran)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  
  // Get survey statistics (including inactive questions)
  GET_SURVEY_STATISTICS: `
    SELECT 
      ps.id, ps.pertanyaan,
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      COUNT(js.id) AS total_responses,
      AVG(CASE 
        WHEN js.jawaban IS NOT NULL THEN 
          (SELECT urutan_rating 
           FROM opsi_rating 
           WHERE id = js.jawaban)
        ELSE NULL 
      END) AS average_rating
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    LEFT JOIN jawaban_survei js ON ps.id = js.pertanyaan_id
    WHERE (pjr.jenis_rating_id != 3 OR pjr.jenis_rating_id IS NULL)
    GROUP BY ps.id, ps.pertanyaan, pjr.jenis_rating_id
    ORDER BY ps.baris
  `,
  
  // Get all survey responses
  GET_ALL_SURVEY_RESPONSES: `
    SELECT 
      js.id, js.nama_lengkap, js.email, js.tanggal_kunjungan, js.pertanyaan_id, 
      js.jawaban, js.created_at, js.saran,
      ps.pertanyaan,
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban
    FROM jawaban_survei js
    JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
    JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    ORDER BY js.created_at DESC
  `,
  
  // Get responses for a specific survey
  GET_RESPONSES_BY_EMAIL_DATE: `
    SELECT 
      js.id, js.nama_lengkap, js.email, js.tanggal_kunjungan, js.pertanyaan_id, 
      js.jawaban, js.created_at, js.saran,
      ps.pertanyaan,
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban
    FROM jawaban_survei js
    JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
    JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    WHERE js.email = ? AND js.tanggal_kunjungan = ?
    ORDER BY ps.baris
  `,
  
  // Add a new survey question
  ADD_QUESTION: `
    INSERT INTO pertanyaan_survei (baris, pertanyaan, is_aktif, is_required)
    VALUES (?, ?, ?, ?)
  `,
  
  // Add question rating association
  ADD_QUESTION_RATING: `
    INSERT INTO pertanyaan_s_jenis_rating (pertanyaan_id, jenis_rating_id, urutan)
    VALUES (?, ?, ?)
  `,
  
  // Update a survey question
  UPDATE_QUESTION: `
    UPDATE pertanyaan_survei
    SET baris = ?, pertanyaan = ?, is_aktif = ?, is_required = ?
    WHERE id = ?
  `,
  
  // Update question rating association
  UPDATE_QUESTION_RATING: `
    UPDATE pertanyaan_s_jenis_rating
    SET jenis_rating_id = ?, urutan = ?
    WHERE pertanyaan_id = ?
  `,
  
  // Get question rating association
  GET_QUESTION_RATING: `
    SELECT pertanyaan_id, jenis_rating_id, urutan
    FROM pertanyaan_s_jenis_rating
    WHERE pertanyaan_id = ?
  `,
  
  // Delete a survey question
  DELETE_QUESTION: `
    DELETE FROM pertanyaan_survei
    WHERE id = ?
  `,
  
  // Add a new rating type
  ADD_RATING_TYPE: `
    INSERT INTO jenis_rating (nama_rating)
    VALUES (?)
  `,
  
  // Add a new rating option
  ADD_RATING_OPTION: `
    INSERT INTO opsi_rating (jenis_rating_id, skala_rating, urutan_rating)
    VALUES (?, ?, ?)
  `
};
