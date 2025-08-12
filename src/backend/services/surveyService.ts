import { executeQuery } from '../config/db';
import { SURVEY_QUERIES, SurveyQuestion, SurveySection, RatingOption, RatingType } from '../models/surveyModel';

export interface QuestionWithRatingOptions extends SurveyQuestion {
  ratingOptions?: RatingOption[];
}

export interface SectionWithQuestions extends SurveySection {
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

export async function getAllSections(): Promise<SurveySection[]> {
  return executeQuery<SurveySection[]>(SURVEY_QUERIES.GET_ALL_SECTIONS);
}

export async function getAllQuestions(): Promise<SurveyQuestion[]> {
  return executeQuery<SurveyQuestion[]>(SURVEY_QUERIES.GET_ALL_QUESTIONS);
}

export async function getQuestionsBySection(): Promise<SectionWithQuestions[]> {
  // Get all sections
  const sections = await executeQuery<SurveySection[]>(SURVEY_QUERIES.GET_ALL_SECTIONS);
  
  // Get all questions organized by section
  const questions = await executeQuery<any[]>(SURVEY_QUERIES.GET_ALL_QUESTIONS_BY_SECTION);
  
  // Get all rating options
  const ratingOptions = await executeQuery<RatingOption[]>(SURVEY_QUERIES.GET_ALL_RATING_OPTIONS);
  
  // Group questions by section
  const sectionsWithQuestions: SectionWithQuestions[] = sections.map(section => {
    const sectionQuestions = questions.filter(q => q.section_id === section.id);
    
    // Add rating options to questions if they are rating type
    const questionsWithOptions = sectionQuestions.map(question => {
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
      ...section,
      questions: questionsWithOptions
    };
  });
  
  return sectionsWithQuestions;
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

export async function getRatingTypes(): Promise<RatingType[]> {
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

export async function addSection(name: string, order: number): Promise<number> {
  const result = await executeQuery<any>(SURVEY_QUERIES.ADD_SECTION, [name, order]);
  return result.insertId;
}

export async function addQuestion(
  sectionId: number,
  order: number,
  question: string,
  type: 'rating' | 'teks'
): Promise<number> {
  // If type is 'rating', use jenis_rating_id = 1 (Skala 5), else use jenis_rating_id = 3 (Text)
  const jenisRatingId = type === 'rating' ? 1 : 3;
  const result = await executeQuery<any>(SURVEY_QUERIES.ADD_QUESTION, [sectionId, order, question, jenisRatingId]);
  return result.insertId;
}

export async function updateQuestion(
  id: number,
  sectionId: number,
  order: number,
  question: string,
  type: 'rating' | 'teks',
  isActive: boolean
): Promise<void> {
  // If type is 'rating', use jenis_rating_id = 1 (Skala 5), else use jenis_rating_id = 3 (Text)
  const jenisRatingId = type === 'rating' ? 1 : 3;
  await executeQuery(SURVEY_QUERIES.UPDATE_QUESTION, [sectionId, order, question, jenisRatingId, isActive ? 1 : 0, id]);
}

export async function deleteQuestion(id: number): Promise<void> {
  await executeQuery(SURVEY_QUERIES.DELETE_QUESTION, [id]);
}
