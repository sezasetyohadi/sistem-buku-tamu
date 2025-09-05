import { surveyService, database, legacyExecuteQuery as executeQuery } from '../../lib/database-service';
import { dbLogger } from '../../lib/logger';
import { SURVEY_QUERIES, SurveyQuestion, RatingOption, RatingType } from '../models/surveyModel';

export interface QuestionWithRatingOptions extends SurveyQuestion {
  ratingOptions?: RatingOption[];
  multiple_rating_types?: { 
    jenis_rating_id: number; 
    is_required?: boolean; 
    nama_rating?: string;
    urutan?: number;
  }[];
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

// Get all questions without duplication (admin use - for display in admin interface)
export async function getAllQuestionsForAdmin(): Promise<QuestionWithRatingOptions[]> {
  // Get questions directly from pertanyaan_survei table to avoid duplication
  const questions = await executeQuery<any[]>(`
    SELECT id, baris, pertanyaan, is_aktif, created_at
    FROM pertanyaan_survei
    ORDER BY baris
  `);

  // For each question, get its associated rating types and options
  const questionsWithOptions = await Promise.all(questions.map(async (question) => {
    // Get all rating types associated with this question
    const questionRatingTypes = await executeQuery<any[]>(
      `SELECT pjr.jenis_rating_id, pjr.urutan, pjr.is_required, jr.nama_rating
       FROM pertanyaan_s_jenis_rating pjr
       JOIN jenis_rating jr ON pjr.jenis_rating_id = jr.id
       WHERE pjr.pertanyaan_id = ? 
       ORDER BY pjr.urutan`,
      [question.id]
    );

    // Since tipe field is removed, we default to rating type
    let tipe_jawaban = 'rating';

    // Get rating options if it's a rating question
    let ratingOptions: RatingOption[] = [];
    if (tipe_jawaban === 'rating' && questionRatingTypes.length > 0) {
      for (const ratingType of questionRatingTypes) {
        const options = await executeQuery<RatingOption[]>(
          SURVEY_QUERIES.GET_RATING_OPTIONS_BY_TYPE,
          [ratingType.jenis_rating_id]
        );
        ratingOptions.push(...options);
      }
    }

    // Format multiple rating types
    const multiple_rating_types = questionRatingTypes.map(rt => ({
      jenis_rating_id: rt.jenis_rating_id,
      is_required: rt.is_required === 1,
      nama_rating: rt.nama_rating,
      urutan: rt.urutan
    }));

    // Set the primary jenis_rating_id (first one for backward compatibility)
    const jenis_rating_id = questionRatingTypes.length > 0 ? questionRatingTypes[0].jenis_rating_id : undefined;
    const is_required = questionRatingTypes.length > 0 ? questionRatingTypes[0].is_required === 1 : true;

    return {
      id: question.id,
      baris: question.baris,
      pertanyaan: question.pertanyaan,
      tipe_jawaban: tipe_jawaban as 'rating' | 'teks',
      is_aktif: question.is_aktif,
      created_at: question.created_at,
      jenis_rating_id,
      is_required,
      ratingOptions,
      multiple_rating_types
    };
  }));

  return questionsWithOptions;
}

// Get only active questions (guest use - for display on survey pages)
export async function getActiveQuestions(): Promise<SurveyQuestion[]> {
  return executeQuery<SurveyQuestion[]>(SURVEY_QUERIES.GET_ACTIVE_QUESTIONS);
}

export async function getActiveQuestionsForGuests(): Promise<QuestionWithRatingOptions[]> {
  // Get all active questions with their rating associations
  const questions = await executeQuery<any[]>(`
    SELECT 
      ps.id, ps.baris, ps.pertanyaan, 
      ps.is_aktif, ps.created_at,
      pjr.jenis_rating_id, pjr.is_required, pjr.urutan as rating_urutan
    FROM pertanyaan_survei ps
    LEFT JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
    LEFT JOIN jenis_rating jr ON pjr.jenis_rating_id = jr.id
    WHERE ps.is_aktif = 1
    ORDER BY ps.baris, pjr.urutan
  `);

  // Group questions with their multiple rating types
  const questionMap = new Map<number, QuestionWithRatingOptions>();
  
  for (const row of questions) {
    if (!questionMap.has(row.id)) {
      // Create base question
      questionMap.set(row.id, {
        id: row.id,
        baris: row.baris,
        pertanyaan: row.pertanyaan,
        is_aktif: row.is_aktif,
        created_at: row.created_at,
        jenis_rating_id: row.jenis_rating_id,
        is_required: row.is_required,
        ratingOptions: [],
        multiple_rating_types: []
      });
    }

    const question = questionMap.get(row.id)!;
    
    // Add rating type info if exists
    if (row.jenis_rating_id) {
      question.multiple_rating_types!.push({
        jenis_rating_id: row.jenis_rating_id,
        is_required: row.is_required === 1,
        nama_rating: row.nama_rating,
        urutan: row.rating_urutan
      });
    }
  }

  // Get rating options for each question
  const questionsArray = Array.from(questionMap.values());
  
  for (const question of questionsArray) {
    if (question.multiple_rating_types && question.multiple_rating_types.length > 0) {
      const allRatingOptions: any[] = [];
      
      // Get rating options for each rating type
      for (const ratingType of question.multiple_rating_types) {
        const ratingOptions = await executeQuery<RatingOption[]>(
          SURVEY_QUERIES.GET_RATING_OPTIONS_BY_TYPE, 
          [ratingType.jenis_rating_id]
        );
        
        // Add rating type info to each option
        const enrichedOptions = ratingOptions.map(option => ({
          ...option,
          rating_type_name: ratingType.nama_rating,
          rating_type_id: ratingType.jenis_rating_id,
          rating_type_urutan: ratingType.urutan
        }));
        
        allRatingOptions.push({
          rating_type_id: ratingType.jenis_rating_id,
          rating_type_name: ratingType.nama_rating,
          rating_type_urutan: ratingType.urutan,
          options: enrichedOptions
        });
      }
      
      question.ratingOptions = allRatingOptions;
    }
  }

  return questionsArray;
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
  const questions = await executeQuery<SurveyQuestion[]>(`
    SELECT id, baris, pertanyaan, is_aktif, created_at
    FROM pertanyaan_survei
    WHERE id = ?
  `, [questionId]);
  
  if (questions.length === 0) {
    throw new Error(`Question with ID ${questionId} not found`);
  }
  
  const question = questions[0];
  
  // Get all rating types associated with this question
  const questionRatingTypes = await executeQuery<any[]>(
    `SELECT pjr.jenis_rating_id, pjr.urutan, pjr.is_required, jr.nama_rating
     FROM pertanyaan_s_jenis_rating pjr
     JOIN jenis_rating jr ON pjr.jenis_rating_id = jr.id
     WHERE pjr.pertanyaan_id = ? 
     ORDER BY pjr.urutan`,
    [questionId]
  );

  // Since tipe field is removed, we default to rating type
  let tipe_jawaban = 'rating';

  // Get rating options if it's a rating question
  let ratingOptions: RatingOption[] = [];
  if (tipe_jawaban === 'rating' && questionRatingTypes.length > 0) {
    for (const ratingType of questionRatingTypes) {
      const options = await executeQuery<RatingOption[]>(
        SURVEY_QUERIES.GET_RATING_OPTIONS_BY_TYPE,
        [ratingType.jenis_rating_id]
      );
      ratingOptions.push(...options);
    }
  }

  // Format multiple rating types
  const multiple_rating_types = questionRatingTypes.map(rt => ({
    jenis_rating_id: rt.jenis_rating_id,
    is_required: rt.is_required === 1,
    nama_rating: rt.nama_rating,
    urutan: rt.urutan
  }));

  // Set the primary jenis_rating_id (first one for backward compatibility)
  const jenis_rating_id = questionRatingTypes.length > 0 ? questionRatingTypes[0].jenis_rating_id : undefined;
  const is_required = questionRatingTypes.length > 0 ? questionRatingTypes[0].is_required === 1 : true;

  return {
    id: question.id,
    baris: question.baris,
    pertanyaan: question.pertanyaan,
    is_aktif: question.is_aktif,
    created_at: question.created_at,
    jenis_rating_id,
    is_required,
    ratingOptions,
    multiple_rating_types
  };
}

export async function getRatingTypes(type?: 'rating' | 'text'): Promise<RatingType[]> {
  // The tipe field has been removed, so we always return all rating types
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
    // First, insert the identity data using the correct column structure from disnaker.sql
    const identityResult = await executeQuery<any>(
      `INSERT INTO jawaban_identitas_survei 
       (nama_lengkap, tanggal_lahir, email, nomor_telepon, jenis_kelamin, alamat, 
        pendidikan_terakhir_id, pekerjaan_utama_id, jenis_layanan_id, saran, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        identity.nama_lengkap,
        identity.tanggal_lahir, // Use tanggal_lahir directly instead of calculating age
        identity.email,
        identity.nomor_telp,
        identity.jenis_kelamin,
        identity.alamat,
        // Get the IDs for foreign key relationships
        await getPendidikanId(identity.pendidikan_terakhir),
        await getProfesiId(identity.pekerjaan_utama),
        await getTujuanKunjunganId(identity.jenis_layanan),
        feedback || null
      ]
    );

    const respondenId = identityResult.insertId;

    // Then insert each survey answer using the correct jawaban_survei structure
    for (const answer of answers) {
      await executeQuery(
        `INSERT INTO jawaban_survei 
         (responden_id, pertanyaan_id, jawaban, created_at) 
         VALUES (?, ?, ?, NOW())`,
        [
          respondenId,
          answer.pertanyaan_id,
          answer.jawaban
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
  isRequired: boolean = true,
  multipleRatingTypes?: { jenis_rating_id: number; is_required?: boolean }[]
): Promise<number> {
  // Start a transaction to ensure both inserts succeed or fail together
  await executeQuery('START TRANSACTION');
  
  try {
    // Get the next row number (max baris + 1) for pertanyaan_survei
    const maxRowResult = await executeQuery<{max_baris: number}[]>(SURVEY_QUERIES.GET_MAX_ROW);
    const nextBaris = maxRowResult[0].max_baris + 1;
    
    // Insert the question first
    const questionResult = await executeQuery<any>(
      SURVEY_QUERIES.ADD_QUESTION, 
      [nextBaris, question, 1] // baris, pertanyaan, is_aktif
    );
    
    const questionId = questionResult.insertId;
    
    // Handle multiple rating types if provided
    if (multipleRatingTypes && multipleRatingTypes.length > 0) {
      // Insert multiple rating associations with proper urutan (order within the question)
      for (let i = 0; i < multipleRatingTypes.length; i++) {
        const ratingType = multipleRatingTypes[i];
        const urutanRating = i + 1; // Sequential order within this question (1, 2, 3...)
        
        await executeQuery(
          SURVEY_QUERIES.ADD_QUESTION_RATING,
          [questionId, ratingType.jenis_rating_id, urutanRating, ratingType.is_required ? 1 : 0]
        );
      }
    } else {
      // Fallback to single rating type (backward compatibility)
      // If type is 'rating', use the provided rating type ID or default to 1 (Skala 5), 
      // else use jenis_rating_id = 3 (Text)
      const jenisRatingId = type === 'rating' ? (ratingTypeId || 1) : 3;
      
      // For single rating type, urutan is always 1
      const urutanRating = 1;
      
      // Insert the rating association
      await executeQuery(
        SURVEY_QUERIES.ADD_QUESTION_RATING,
        [questionId, jenisRatingId, urutanRating, isRequired ? 1 : 0]
      );
    }
    
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
  isRequired: boolean = true,
  multipleRatingTypes?: { jenis_rating_id: number; is_required?: boolean }[]
): Promise<void> {
  // Start a transaction to ensure both updates succeed or fail together
  await executeQuery('START TRANSACTION');
  
  try {
    // Update the question first
    await executeQuery(
      SURVEY_QUERIES.UPDATE_QUESTION, 
      [baris, question, isActive ? 1 : 0, id]
    );
    
    // Remove existing rating associations for this question
    await executeQuery(
      'DELETE FROM pertanyaan_s_jenis_rating WHERE pertanyaan_id = ?',
      [id]
    );
    
    // Handle multiple rating types if provided
    if (multipleRatingTypes && multipleRatingTypes.length > 0) {
      // Insert multiple rating associations with proper urutan (order within the question)
      for (let i = 0; i < multipleRatingTypes.length; i++) {
        const ratingType = multipleRatingTypes[i];
        const urutanRating = i + 1; // Sequential order within this question (1, 2, 3...)
        
        await executeQuery(
          SURVEY_QUERIES.ADD_QUESTION_RATING,
          [id, ratingType.jenis_rating_id, urutanRating, ratingType.is_required ? 1 : 0]
        );
      }
    } else {
      // Fallback to single rating type (backward compatibility)
      // If type is 'rating', use the provided rating type ID or default to 1 (Skala 5),
      // else use jenis_rating_id = 3 (Text)
      const jenisRatingId = type === 'rating' ? (ratingTypeId || 1) : 3;
      
      // For single rating type, urutan is always 1
      const urutanRating = 1;
      
      // Insert the rating association
      await executeQuery(
        SURVEY_QUERIES.ADD_QUESTION_RATING,
        [id, jenisRatingId, urutanRating, isRequired ? 1 : 0]
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
