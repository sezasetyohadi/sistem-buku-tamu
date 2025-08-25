import { executeQuery } from '../config/db';
import { SURVEY_QUERIES, SurveyQuestion, RatingOption, RatingType } from '../models/surveyModel';

export interface QuestionWithRatingOptions extends SurveyQuestion {
  ratingOptions?: RatingOption[];
}

export interface RowWithQuestions {
  row: number;
  questions: QuestionWithRatingOptions[];
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

export async function submitSurveyAnswers(answers: SurveyAnswer[]): Promise<void> {
  // Use a transaction to ensure all answers are saved
  await executeQuery('START TRANSACTION');
  
  try {
    for (const answer of answers) {
      // Convert string answers to numeric for storage (for text questions)
      const numericAnswer = typeof answer.jawaban === 'string' ? 0 : answer.jawaban;
      
      await executeQuery(
        SURVEY_QUERIES.SUBMIT_ANSWER,
        [
          answer.nama_lengkap,
          answer.email,
          answer.tanggal_kunjungan,
          answer.pertanyaan_id,
          numericAnswer,
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
    SELECT COUNT(DISTINCT email) as unique_respondents 
    FROM jawaban_survei
  `;
  
  const result = await executeQuery<{ unique_respondents: number }[]>(query);
  return result[0]?.unique_respondents || 0;
}

export async function getCompletionRate(): Promise<number> {
  // This function calculates the percentage of respondents who completed all required questions
  const query = `
    SELECT 
      COUNT(DISTINCT js.email) as total_respondents,
      COUNT(DISTINCT CASE WHEN answered_all_required.email IS NOT NULL THEN js.email END) as completed_all
    FROM jawaban_survei js
    LEFT JOIN (
      SELECT DISTINCT js.email
      FROM jawaban_survei js
      JOIN pertanyaan_survei ps ON js.pertanyaan_id = ps.id
      JOIN pertanyaan_s_jenis_rating pjr ON ps.id = pjr.pertanyaan_id
      WHERE pjr.is_required = 1
      GROUP BY js.email
      HAVING COUNT(DISTINCT js.pertanyaan_id) = (
        SELECT COUNT(DISTINCT ps2.id)
        FROM pertanyaan_survei ps2
        JOIN pertanyaan_s_jenis_rating pjr2 ON ps2.id = pjr2.pertanyaan_id
        WHERE pjr2.is_required = 1 AND ps2.is_aktif = 1
      )
    ) as answered_all_required ON js.email = answered_all_required.email
  `;
  
  const result = await executeQuery<{ total_respondents: number, completed_all: number }[]>(query);
  
  if (result[0].total_respondents === 0) {
    return 0;
  }
  
  return Math.round((result[0].completed_all / result[0].total_respondents) * 100);
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
    
    // Always add to column 1
    const column = 1;
    
    // Insert the question first
    const questionResult = await executeQuery<any>(
      SURVEY_QUERIES.ADD_QUESTION, 
      [nextRow, column, question, 1]
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
  kolom: number,
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
      [baris, kolom, question, isActive ? 1 : 0, id]
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
