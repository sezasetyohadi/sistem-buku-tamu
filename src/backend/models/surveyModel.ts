// Define interfaces for survey-related types
// Section interface removed as it's no longer used

export interface SurveyQuestion {
  id: number;
  baris: number;
  kolom: number;
  pertanyaan: string;
  tipe_jawaban: 'rating' | 'teks';
  is_aktif: boolean;
  created_at: string;
  jenis_rating_id?: number; // This will not be stored directly in pertanyaan_survei but in pertanyaan_s_jenis_rating
  is_required?: boolean;
}

export interface RatingType {
  id: number;
  tipe: 'rating' | 'text';
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
  jawaban: number;
  created_at?: string;
  saran?: string;
}

// SQL queries for survey functionality
export const SURVEY_QUERIES = {
  // Get all active questions organized by rows and columns
  GET_ALL_QUESTIONS_BY_LAYOUT: `
    SELECT 
      ps.id, ps.baris, ps.kolom, ps.pertanyaan, 
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, pjr.jenis_rating_id,
      pjr.is_required, pjr.urutan
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    WHERE ps.is_aktif = 1
    ORDER BY ps.baris, ps.kolom
  `,
  
  // Get all active questions
  GET_ALL_QUESTIONS: `
    SELECT 
      ps.id, ps.baris, ps.kolom, ps.pertanyaan, 
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, pjr.jenis_rating_id,
      pjr.is_required, pjr.urutan
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    WHERE ps.is_aktif = 1
    ORDER BY ps.baris, ps.kolom
  `,
  
  // Get a specific question by ID
  GET_QUESTION_BY_ID: `
    SELECT 
      ps.id, ps.baris, ps.kolom, ps.pertanyaan, 
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, pjr.jenis_rating_id,
      pjr.is_required, pjr.urutan
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
    SELECT id, tipe, nama_rating
    FROM jenis_rating
    ORDER BY id
  `,
  
  // Get rating types by type (rating or text)
  GET_RATING_TYPES_BY_TYPE: `
    SELECT id, tipe, nama_rating
    FROM jenis_rating
    WHERE tipe = ?
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
  
  // Get survey statistics
  GET_SURVEY_STATISTICS: `
    SELECT 
      ps.id, ps.pertanyaan,
      CASE 
        WHEN pjr.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      COUNT(js.id) AS total_responses,
      AVG(js.jawaban) AS average_rating
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    LEFT JOIN jawaban_survei js ON ps.id = js.pertanyaan_id
    WHERE ps.is_aktif = 1 AND (pjr.jenis_rating_id != 3 OR pjr.jenis_rating_id IS NULL)
    GROUP BY ps.id, ps.pertanyaan, pjr.jenis_rating_id
    ORDER BY ps.baris, ps.kolom
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
    ORDER BY ps.baris, ps.kolom
  `,
  
  // Add a new survey question
  ADD_QUESTION: `
    INSERT INTO pertanyaan_survei (baris, kolom, pertanyaan, is_aktif)
    VALUES (?, ?, ?, ?)
  `,
  
  // Add question rating association
  ADD_QUESTION_RATING: `
    INSERT INTO pertanyaan_s_jenis_rating (pertanyaan_id, jenis_rating_id, urutan, is_required)
    VALUES (?, ?, ?, ?)
  `,
  
  // Update a survey question
  UPDATE_QUESTION: `
    UPDATE pertanyaan_survei
    SET baris = ?, kolom = ?, pertanyaan = ?, is_aktif = ?
    WHERE id = ?
  `,
  
  // Update question rating association
  UPDATE_QUESTION_RATING: `
    UPDATE pertanyaan_s_jenis_rating
    SET jenis_rating_id = ?, urutan = ?, is_required = ?
    WHERE pertanyaan_id = ?
  `,
  
  // Get question rating association
  GET_QUESTION_RATING: `
    SELECT pertanyaan_id, jenis_rating_id, urutan, is_required
    FROM pertanyaan_s_jenis_rating
    WHERE pertanyaan_id = ?
  `,
  
  // Delete a survey question
  DELETE_QUESTION: `
    DELETE FROM pertanyaan_survei
    WHERE id = ?
  `
};
