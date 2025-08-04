import { executeQuery } from '../config/db';
import { SURVEY_QUERIES } from '../models/surveyModel';

export interface SurveyQuestion {
  id: number;
  pertanyaan: string;
  is_aktif: boolean;
  created_at: string;
  options: SurveyOption[];
}

export interface SurveyOption {
  id: number;
  pertanyaan_id: number;
  isi_opsi: string;
  urutan: number;
}

export interface SurveyAnswer {
  pertanyaan_id: number;
  jawaban: number;
  nama_lengkap: string;
  jenis_kelamin: string;
  pendidikan_terakhir: string;
  profesi: string;
  instansi: string;
  saran?: string;
}

export async function getAllSurveyQuestions(): Promise<SurveyQuestion[]> {
  return executeQuery<SurveyQuestion[]>(SURVEY_QUERIES.GET_ALL_QUESTIONS);
}

export async function getSurveyQuestionWithOptions(questionId: number): Promise<SurveyQuestion> {
  // First get the question
  const questions = await executeQuery<SurveyQuestion[]>(SURVEY_QUERIES.GET_QUESTION_BY_ID, [questionId]);
  
  if (questions.length === 0) {
    throw new Error(`Question with ID ${questionId} not found`);
  }
  
  const question = questions[0];
  
  // Then get the options for this question
  const options = await executeQuery<SurveyOption[]>(SURVEY_QUERIES.GET_OPTIONS_BY_QUESTION_ID, [questionId]);
  
  // Combine and return
  return {
    ...question,
    options: options || []
  };
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
          answer.jenis_kelamin,
          answer.pendidikan_terakhir,
          answer.profesi,
          answer.instansi,
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

export async function initSurveyTables(): Promise<void> {
  await executeQuery(SURVEY_QUERIES.CREATE_QUESTIONS_TABLE);
  await executeQuery(SURVEY_QUERIES.CREATE_OPTIONS_TABLE);
  await executeQuery(SURVEY_QUERIES.CREATE_ANSWERS_TABLE);
}
