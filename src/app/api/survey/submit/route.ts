import { NextRequest, NextResponse } from 'next/server';
import { submitSurveyWithIdentity } from '@/backend/services/surveyService';
import { withApiMiddleware, validateJsonBody } from '@/lib/api-middleware';
import { ErrorCodes, HttpStatus } from '@/lib/api-response';
import { 
  validateAndSanitize,
  SURVEY_RESPONSE_SCHEMA,
  ValidationSchema,
  validateSchema
} from '@/lib/validation';
import { apiLogger } from '@/lib/logger';

// Custom validation schema for survey submission
const SURVEY_SUBMIT_SCHEMA: ValidationSchema = {
  identity: {
    required: true,
    custom: (value) => {
      if (!value || typeof value !== 'object') {
        return 'Data identitas harus berupa objek';
      }
      
      const identity = value as Record<string, any>;
      
      // Validate required identity fields
      if (!identity.nama_lengkap || typeof identity.nama_lengkap !== 'string') {
        return 'Nama lengkap wajib diisi';
      }
      
      if (!identity.email || typeof identity.email !== 'string') {
        return 'Email wajib diisi';
      }
      
      if (!identity.nomor_telp || typeof identity.nomor_telp !== 'string') {
        return 'Nomor telepon wajib diisi';
      }
      
      return null;
    }
  },
  answers: {
    required: true,
    custom: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return 'Minimal satu jawaban survei harus diisi';
      }
      
      const answers = value as any[];
      
      // Validate each answer
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        
        if (!answer || typeof answer !== 'object') {
          return `Jawaban ${i + 1} tidak valid`;
        }
        
        if (!answer.pertanyaan_id || typeof answer.pertanyaan_id !== 'number') {
          return `ID pertanyaan untuk jawaban ${i + 1} tidak valid`;
        }
        
        if (answer.rating !== undefined) {
          if (typeof answer.rating !== 'number' || answer.rating < 1 || answer.rating > 5) {
            return `Rating untuk jawaban ${i + 1} harus antara 1-5`;
          }
        }
      }
      
      return null;
    }
  },
  feedback: {
    required: false,
    maxLength: 1000,
    message: 'Feedback maksimal 1000 karakter'
  }
};

export const POST = withApiMiddleware(async (request, response, context) => {
  try {
    const body = await validateJsonBody(request);
    
    // Validate survey submission data
    const validation = validateSchema(body, SURVEY_SUBMIT_SCHEMA);

    if (!validation.isValid) {
      apiLogger.warn('Survey submission validation failed', {
        operation: 'POST_SURVEY_SUBMIT_VALIDATION_ERROR',
        metadata: {
          errors: validation.errors,
          firstError: validation.firstError
        }
      });

      return response.error(
        validation.firstError || 'Data survei tidak valid',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        validation.errors
      );
    }

    apiLogger.info('Processing survey submission', {
      operation: 'POST_SURVEY_SUBMIT',
      metadata: {
        answerCount: body.answers.length,
        hasFeedback: !!body.feedback,
        hasIdentity: !!body.identity
      }
    });

    // Submit identity and answers
    await submitSurveyWithIdentity(body.identity, body.answers, body.feedback);
    
    apiLogger.info('Survey submitted successfully', {
      operation: 'POST_SURVEY_SUBMIT_SUCCESS',
      metadata: {
        answerCount: body.answers.length
      }
    });
    
    return response.success(
      { submitted: true },
      'Survei berhasil dikirim'
    );
  } catch (error: any) {
    apiLogger.error('Survey submission failed', {
      operation: 'POST_SURVEY_SUBMIT_ERROR',
      metadata: {
        requestId: context.requestId
      }
    }, error instanceof Error ? error : new Error(String(error)));
    
    return response.error(
      'Gagal mengirim survei',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCodes.INTERNAL_ERROR,
      { originalError: error.message }
    );
  }
});
