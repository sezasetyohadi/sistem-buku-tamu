// Define interfaces for survey-related types
export interface SurveyQuestion {
  id: number;
  pertanyaan: string;
  is_aktif: boolean;
  created_at: string;
}

export interface SurveyOption {
  id: number;
  pertanyaan_id: number;
  isi_opsi: string;
  urutan: number;
}

export interface SurveyAnswer {
  id?: number;
  nama_lengkap: string;
  jenis_kelamin: string;
  pendidikan_terakhir: string;
  profesi: string;
  instansi: string;
  pertanyaan_id: number;
  jawaban: number;
  created_at?: string;
  saran?: string;
}

// SQL queries for survey functionality
export const SURVEY_QUERIES = {
  // Create tables queries
  CREATE_QUESTIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS pertanyaan_survei (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pertanyaan TEXT NOT NULL,
      is_aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  
  CREATE_OPTIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS opsi_jawaban (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pertanyaan_id INT NOT NULL,
      isi_opsi VARCHAR(100) NOT NULL,
      urutan INT DEFAULT 1,
      FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei(id) ON DELETE CASCADE
    )
  `,
  
  CREATE_ANSWERS_TABLE: `
    CREATE TABLE IF NOT EXISTS jawaban_survei (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_lengkap VARCHAR(100) NOT NULL,
      jenis_kelamin ENUM('Laki-laki','Perempuan') NOT NULL,
      pendidikan_terakhir VARCHAR(100) DEFAULT NULL,
      profesi VARCHAR(100) DEFAULT NULL,
      instansi VARCHAR(100) DEFAULT NULL,
      pertanyaan_id INT NOT NULL,
      jawaban INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      saran TEXT DEFAULT NULL,
      FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei(id) ON DELETE CASCADE
    )
  `,
  
  // Query to get all active questions
  GET_ALL_QUESTIONS: `
    SELECT id, pertanyaan, is_aktif, created_at
    FROM pertanyaan_survei
    WHERE is_aktif = 1
    ORDER BY id
  `,
  
  // Query to get a specific question by ID
  GET_QUESTION_BY_ID: `
    SELECT id, pertanyaan, is_aktif, created_at
    FROM pertanyaan_survei
    WHERE id = ?
  `,
  
  // Query to get options for a specific question
  GET_OPTIONS_BY_QUESTION_ID: `
    SELECT id, pertanyaan_id, isi_opsi, urutan
    FROM opsi_jawaban
    WHERE pertanyaan_id = ?
    ORDER BY urutan
  `,
  
  // Query to submit a survey answer
  SUBMIT_ANSWER: `
    INSERT INTO jawaban_survei 
    (nama_lengkap, jenis_kelamin, pendidikan_terakhir, profesi, instansi, pertanyaan_id, jawaban, saran)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  
  // Insert predefined survey questions if none exist
  INSERT_DEFAULT_QUESTIONS: `
    INSERT INTO pertanyaan_survei (pertanyaan, is_aktif)
    SELECT * FROM (
      SELECT 'Bagaimana penilaian Anda terhadap kemudahan akses layanan?' AS pertanyaan, 1 AS is_aktif UNION
      SELECT 'Bagaimana penilaian Anda terhadap kecepatan pelayanan?' AS pertanyaan, 1 AS is_aktif UNION
      SELECT 'Bagaimana penilaian Anda terhadap keramahan petugas?' AS pertanyaan, 1 AS is_aktif UNION
      SELECT 'Bagaimana penilaian Anda terhadap kualitas hasil layanan?' AS pertanyaan, 1 AS is_aktif
    ) AS tmp
    WHERE NOT EXISTS (SELECT id FROM pertanyaan_survei LIMIT 1)
  `,
  
  // Insert predefined options for questions
  INSERT_DEFAULT_OPTIONS: `
    INSERT INTO opsi_jawaban (pertanyaan_id, isi_opsi, urutan)
    VALUES
    (1, 'Memuaskan', 1),
    (1, 'Cukup', 2),
    (1, 'Kurang Memuaskan', 3),
    (2, 'Memuaskan', 1),
    (2, 'Cukup', 2),
    (2, 'Kurang Memuaskan', 3),
    (3, 'Memuaskan', 1),
    (3, 'Cukup', 2),
    (3, 'Kurang Memuaskan', 3),
    (4, 'Memuaskan', 1),
    (4, 'Cukup', 2),
    (4, 'Kurang Memuaskan', 3)
  `,
};
