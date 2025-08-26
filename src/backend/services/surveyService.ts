import { executeQuery } from '../config/db';
import { SURVEY_QUERIES, SurveyQuestion, RatingOption, RatingType } from '../models/surveyModel';

export interface QuestionWithRatingOptions extends SurveyQuestion {
  ratingOptions?: RatingOption[];
}

export interface RowWithQuestions {
  row: number;
  questions: QuestionWithRatingOptions[];
}

export interface SurveyIdentity {
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  alamat: string;
  email: string;
  nomor_telp: string;
  pendidikan_terakhir: string;
  pekerjaan_utama: string;
  jenis_layanan: string;
}

export interface SurveyAnswer {
  pertanyaan_id: number;
  jawaban: number | string;
  nama_lengkap: string;
  email: string;
  tanggal_kunjungan: string;
  saran?: string;
}

export interface SurveyStatistics {
  id: number;
  pertanyaan: string;
  tipe_jawaban: string;
  total_responses: number;
  average_rating: number;
}

export async function getAllQuestions(): Promise<SurveyQuestion[]> {
  return executeQuery<SurveyQuestion[]>(SURVEY_QUERIES.GET_ALL_QUESTIONS);
}

// Get only active questions (guest use - for display on survey pages)
export async function getActiveQuestions(): Promise<SurveyQuestion[]> {
  return executeQuery<SurveyQuestion[]>(SURVEY_QUERIES.GET_ACTIVE_QUESTIONS);
}

export async function getQuestionsByLayout(): Promise<RowWithQuestions[]> {
  // Get all questions organized by layout
  const questions = await executeQuery<any[]>(SURVEY_QUERIES.GET_ALL_QUESTIONS_BY_LAYOUT);
  
  // Get all rating options
  const ratingOptions = await executeQuery<RatingOption[]>(SURVEY_QUERIES.GET_ALL_RATING_OPTIONS);
  
  // Group questions by rows
  const uniqueRows = Array.from(new Set(questions.map(q => q.baris))).sort((a, b) => a - b);
  
  const rowsWithQuestions: RowWithQuestions[] = uniqueRows.map(rowNum => {
    const rowQuestions = questions.filter(q => q.baris === rowNum);
    
    // Add rating options to questions if they are rating type
    const questionsWithOptions = rowQuestions.map(question => {
      if (question.tipe_jawaban === 'rating' && question.jenis_rating_id) {
        // Get the rating options directly based on the question's jenis_rating_id from the database
        const options = ratingOptions.filter(o => o.jenis_rating_id === question.jenis_rating_id);
        return {
          ...question,
          ratingOptions: options
        };
      }
      return question;
    });
    
    return {
      row: rowNum,
      questions: questionsWithOptions
    };
  });
  
  return rowsWithQuestions;
}

export async function getQuestionById(questionId: number): Promise<QuestionWithRatingOptions> {
  // First get the question
  const questions = await executeQuery<SurveyQuestion[]>(SURVEY_QUERIES.GET_QUESTION_BY_ID, [questionId]);
  
  if (questions.length === 0) {
    throw new Error(`Question with ID ${questionId} not found`);
  }
  
  const question = questions[0];
  
  // If it's a rating question, get the rating options
  if (question.tipe_jawaban === 'rating' && question.jenis_rating_id) {
    // Get the rating options directly based on the question's jenis_rating_id from the database
    const ratingOptions = await executeQuery<RatingOption[]>(SURVEY_QUERIES.GET_RATING_OPTIONS_BY_TYPE, [question.jenis_rating_id]);
    
    return {
      ...question,
      ratingOptions: ratingOptions || []
    };
  }
  
  return question;
}

export async function getRatingTypes(type?: 'rating' | 'text'): Promise<RatingType[]> {
  // If a specific type is requested, use the filtered query
  if (type) {
    return executeQuery<RatingType[]>(SURVEY_QUERIES.GET_RATING_TYPES_BY_TYPE, [type]);
  }
  
  // Otherwise, return all rating types
  return executeQuery<RatingType[]>(SURVEY_QUERIES.GET_ALL_RATING_TYPES);
}

export async function getRatingOptions(ratingTypeId: number): Promise<RatingOption[]> {
  return executeQuery<RatingOption[]>(SURVEY_QUERIES.GET_RATING_OPTIONS_BY_TYPE, [ratingTypeId]);
}

export async function submitSurveyWithIdentity(
  identity: SurveyIdentity, 
  answers: { pertanyaan_id: number; jawaban: number | string }[], 
  feedback?: string
): Promise<void> {
  // Use a transaction to ensure all data is saved consistently
  await executeQuery('START TRANSACTION');
  
  try {
    // First, insert the identity data and get the respondent ID
    const identityResult = await executeQuery<any>(
      `INSERT INTO jawaban_identitas_survei 
       (nama_lengkap, jenis_kelamin, pendidikan_terakhir_id, profesi_id, instansi, email, nomor_telp, tanggal_lahir, alamat, jenis_layanan_id, saran, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        identity.nama_lengkap,
        identity.jenis_kelamin,
        // We need to get the IDs for foreign key relationships
        await getPendidikanId(identity.pendidikan_terakhir),
        await getProfesiId(identity.pekerjaan_utama),
        null, // instansi can be null
        identity.email,
        identity.nomor_telp,
        identity.tanggal_lahir,
        identity.alamat,
        await getTujuanKunjunganId(identity.jenis_layanan),
        feedback || null
      ]
    );

    const respondenId = identityResult.insertId;

    // Then insert each survey answer
    for (const answer of answers) {
      await executeQuery(
        `INSERT INTO jawaban_survei 
         (responden_id, pertanyaan_id, jawaban_numerik, jawaban_text, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [
          respondenId,
          answer.pertanyaan_id,
          typeof answer.jawaban === 'number' ? answer.jawaban : null,
          typeof answer.jawaban === 'string' ? answer.jawaban : null
        ]
      );
    }
    
    await executeQuery('COMMIT');
  } catch (error) {
    await executeQuery('ROLLBACK');
    throw error;
  }
}

// Helper functions to get IDs for foreign key relationships
async function getPendidikanId(pendidikan: string): Promise<number | null> {
  try {
    const result = await executeQuery<{id: number}[]>(
      'SELECT id FROM pendidikan_terakhir WHERE pendidikan_terakhir = ?',
      [pendidikan]
    );
    return result.length > 0 ? result[0].id : null;
  } catch (error) {
    console.error('Error getting pendidikan ID:', error);
    return null;
  }
}

async function getProfesiId(profesi: string): Promise<number | null> {
  try {
    const result = await executeQuery<{id: number}[]>(
      'SELECT id FROM profesi WHERE nama_profesi = ?',
      [profesi]
    );
    return result.length > 0 ? result[0].id : null;
  } catch (error) {
    console.error('Error getting profesi ID:', error);
    return null;
  }
}

async function getTujuanKunjunganId(tujuan: string): Promise<number | null> {
  try {
    const result = await executeQuery<{id: number}[]>(
      'SELECT id FROM tujuan_kunjungan WHERE tujuan = ?',
      [tujuan]
    );
    return result.length > 0 ? result[0].id : null;
  } catch (error) {
    console.error('Error getting tujuan kunjungan ID:', error);
    return null;
  }
}

export async function submitSurveyAnswers(answers: SurveyAnswer[]): Promise<void> {
  // Use a transaction to ensure all answers are saved
  await executeQuery('START TRANSACTION');
  
  try {
    for (const answer of answers) {
      await executeQuery(
        SURVEY_QUERIES.SUBMIT_ANSWER,
        [
          answer.nama_lengkap,
          answer.email,
          answer.tanggal_kunjungan,
          answer.pertanyaan_id,
          answer.jawaban,
          answer.saran || null
        ]
      );
    }
    
    await executeQuery('COMMIT');
  } catch (error) {
    await executeQuery('ROLLBACK');
    throw error;
  }
}

export async function getSurveyStatistics(): Promise<SurveyStatistics[]> {
  return executeQuery<SurveyStatistics[]>(SURVEY_QUERIES.GET_SURVEY_STATISTICS);
}

export async function getSurveyResponses(): Promise<any[]> {
  return executeQuery(SURVEY_QUERIES.GET_ALL_SURVEY_RESPONSES);
}

export async function getSurveyResponsesByEmailAndDate(email: string, date: string): Promise<any[]> {
  return executeQuery(SURVEY_QUERIES.GET_RESPONSES_BY_EMAIL_DATE, [email, date]);
}

export async function getUniqueRespondents(): Promise<number> {
  const query = `
    SELECT COUNT(*) as unique_respondents 
    FROM jawaban_identitas_survei
  `;
  
  const result = await executeQuery<{ unique_respondents: number }[]>(query);
  return result[0]?.unique_respondents || 0;
}

export async function getCompletionRate(): Promise<number> {
  // For now, we'll simplify this to return 100% completion rate
  // since we don't have detailed data on which questions were answered by each respondent in jawaban_identitas_survei
  return 100;

  // TODO: Implement proper completion rate calculation when the data structure is established
  // This would require a new query that properly joins jawaban_identitas_survei with other relevant tables
}

export async function addQuestion(
  question: string,
  type: 'rating' | 'teks',
  ratingTypeId?: number,
  isRequired: boolean = true
): Promise<number> {
  // Start a transaction to ensure both inserts succeed or fail together
  await executeQuery('START TRANSACTION');
  
  try {
    // Get the next row number (max row + 1)
    const maxRowResult = await executeQuery<{max_baris: number}[]>(SURVEY_QUERIES.GET_MAX_ROW);
    const nextRow = maxRowResult[0].max_baris + 1;
    
    // Insert the question first
    const questionResult = await executeQuery<any>(
      SURVEY_QUERIES.ADD_QUESTION, 
      [nextRow, question, 1]
    );
    
    const questionId = questionResult.insertId;
    
    // If type is 'rating', use the provided rating type ID or default to 1 (Skala 5), 
    // else use jenis_rating_id = 3 (Text)
    const jenisRatingId = type === 'rating' ? (ratingTypeId || 1) : 3;
    
    // Default order for ratings: Skala 5 = 1, Skala 3 = 2, Text = 3
    const urutan = jenisRatingId === 1 ? 1 : jenisRatingId === 2 ? 2 : 3;
    
    // Insert the rating association
    await executeQuery(
      SURVEY_QUERIES.ADD_QUESTION_RATING,
      [questionId, jenisRatingId, urutan, isRequired ? 1 : 0]
    );
    
    // Commit the transaction
    await executeQuery('COMMIT');
    
    return questionId;
  } catch (error) {
    // Rollback in case of error
    await executeQuery('ROLLBACK');
    throw error;
  }
}

export async function updateQuestion(
  id: number,
  baris: number,
  question: string,
  type: 'rating' | 'teks',
  isActive: boolean,
  ratingTypeId?: number,
  isRequired: boolean = true
): Promise<void> {
  // Start a transaction to ensure both updates succeed or fail together
  await executeQuery('START TRANSACTION');
  
  try {
    // Update the question first
    await executeQuery(
      SURVEY_QUERIES.UPDATE_QUESTION, 
      [baris, question, isActive ? 1 : 0, id]
    );
    
    // If type is 'rating', use the provided rating type ID or default to 1 (Skala 5),
    // else use jenis_rating_id = 3 (Text)
    const jenisRatingId = type === 'rating' ? (ratingTypeId || 1) : 3;
    
    // Default order for ratings: Skala 5 = 1, Skala 3 = 2, Text = 3
    const urutan = jenisRatingId === 1 ? 1 : jenisRatingId === 2 ? 2 : 3;
    
    // Check if rating association exists
    const ratingAssociations = await executeQuery<any[]>(
      SURVEY_QUERIES.GET_QUESTION_RATING,
      [id]
    );
    
    if (ratingAssociations.length > 0) {
      // Update existing association
      await executeQuery(
        SURVEY_QUERIES.UPDATE_QUESTION_RATING,
        [jenisRatingId, urutan, isRequired ? 1 : 0, id]
      );
    } else {
      // Create new association if it doesn't exist
      await executeQuery(
        SURVEY_QUERIES.ADD_QUESTION_RATING,
        [id, jenisRatingId, urutan, isRequired ? 1 : 0]
      );
    }
    
    // Commit the transaction
    await executeQuery('COMMIT');
  } catch (error) {
    // Rollback in case of error
    await executeQuery('ROLLBACK');
    throw error;
  }
}

export async function deleteQuestion(id: number): Promise<void> {
  await executeQuery(SURVEY_QUERIES.DELETE_QUESTION, [id]);
}
