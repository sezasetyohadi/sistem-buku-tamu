// Define interfaces for survey-related types
export interface SurveySection {
  id: number;
  nama_section: string;
  urutan: number;
}

export interface SurveyQuestion {
  id: number;
  section_id: number | null;
  urutan: number;
  pertanyaan: string;
  tipe_jawaban: 'rating' | 'teks';
  is_aktif: boolean;
  created_at: string;
  jenis_rating_id?: number;
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
  jawaban: number;
  created_at?: string;
  saran?: string;
}

// SQL queries for survey functionality
export const SURVEY_QUERIES = {
  // Get all sections
  GET_ALL_SECTIONS: `
    SELECT id, nama_section, urutan
    FROM section_survei
    ORDER BY urutan
  `,
  
  // Get section by ID
  GET_SECTION_BY_ID: `
    SELECT id, nama_section, urutan
    FROM section_survei
    WHERE id = ?
  `,
  
  // Get all active questions organized by section
  GET_ALL_QUESTIONS_BY_SECTION: `
    SELECT 
      ps.id, ps.section_id, ps.urutan, ps.pertanyaan, 
      CASE 
        WHEN ps.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      ps.is_aktif, ps.created_at, ps.jenis_rating_id,
      ss.nama_section
    FROM pertanyaan_survei ps
    LEFT JOIN section_survei ss ON ps.section_id = ss.id
    WHERE ps.is_aktif = 1
    ORDER BY ss.urutan, ps.urutan
  `,
  
  // Get all active questions
  GET_ALL_QUESTIONS: `
    SELECT id, section_id, urutan, pertanyaan, 
    CASE 
      WHEN jenis_rating_id = 3 THEN 'teks'
      ELSE 'rating'
    END as tipe_jawaban, 
    is_aktif, created_at, jenis_rating_id
    FROM pertanyaan_survei
    WHERE is_aktif = 1
    ORDER BY section_id, urutan
  `,
  
  // Get a specific question by ID
  GET_QUESTION_BY_ID: `
    SELECT id, section_id, urutan, pertanyaan, 
    CASE 
      WHEN jenis_rating_id = 3 THEN 'teks'
      ELSE 'rating'
    END as tipe_jawaban, 
    is_aktif, created_at, jenis_rating_id
    FROM pertanyaan_survei
    WHERE id = ?
  `,
  
  // Get all rating types
  GET_ALL_RATING_TYPES: `
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
  
  // Get survey statistics
  GET_SURVEY_STATISTICS: `
    SELECT 
      ps.id, ps.pertanyaan,
      CASE 
        WHEN ps.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban,
      COUNT(js.id) AS total_responses,
      AVG(js.jawaban) AS average_rating
    FROM pertanyaan_survei ps
    LEFT JOIN jawaban_survei js ON ps.id = js.pertanyaan_id
    WHERE ps.is_aktif = 1 AND ps.jenis_rating_id != 3
    GROUP BY ps.id
    ORDER BY ps.section_id, ps.urutan
  `,
  
  // Get all survey responses
  GET_ALL_SURVEY_RESPONSES: `
    SELECT 
      js.id, js.nama_lengkap, js.email, js.tanggal_kunjungan, js.pertanyaan_id, 
      js.jawaban, js.created_at, js.saran,
      ps.pertanyaan,
      CASE 
        WHEN ps.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban
    FROM jawaban_survei js
    JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
    ORDER BY js.created_at DESC
  `,
  
  // Get responses for a specific survey
  GET_RESPONSES_BY_EMAIL_DATE: `
    SELECT 
      js.id, js.nama_lengkap, js.email, js.tanggal_kunjungan, js.pertanyaan_id, 
      js.jawaban, js.created_at, js.saran,
      ps.pertanyaan,
      CASE 
        WHEN ps.jenis_rating_id = 3 THEN 'teks'
        ELSE 'rating'
      END as tipe_jawaban
    FROM jawaban_survei js
    JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
    WHERE js.email = ? AND js.tanggal_kunjungan = ?
    ORDER BY ps.section_id, ps.urutan
  `,
  
  // Add a new survey section
  ADD_SECTION: `
    INSERT INTO section_survei (nama_section, urutan)
    VALUES (?, ?)
  `,
  
  // Add a new survey question
  ADD_QUESTION: `
    INSERT INTO pertanyaan_survei (section_id, urutan, pertanyaan, jenis_rating_id, is_aktif)
    VALUES (?, ?, ?, ?, 1)
  `,
  
  // Update a survey question
  UPDATE_QUESTION: `
    UPDATE pertanyaan_survei
    SET section_id = ?, urutan = ?, pertanyaan = ?, jenis_rating_id = ?, is_aktif = ?
    WHERE id = ?
  `,
  
  // Delete a survey question
  DELETE_QUESTION: `
    DELETE FROM pertanyaan_survei
    WHERE id = ?
  `
};
