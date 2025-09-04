// API functions for survey operations
import { 
  SurveyQuestion, 
  RatingOption, 
  SurveySubmission,
  LookupData 
} from '@/types/survey-types';

/**
 * Fetch active survey questions for guests
 */
export async function fetchSurveyQuestions(): Promise<SurveyQuestion[]> {
  try {
    const response = await fetch('/api/survey/questions?for_guest=true');
    const data = await response.json();

    if (data.success) {
      return data.data || [];
    }
    
    throw new Error(data.message || 'Failed to fetch survey questions');
  } catch (error) {
    console.error('Error fetching survey questions:', error);
    throw error;
  }
}

/**
 * Fetch rating options for survey questions
 */
export async function fetchRatingOptions(): Promise<RatingOption[]> {
  try {
    const response = await fetch('/api/survey/rating-options');
    const data = await response.json();

    if (data.success) {
      return data.data || [];
    }
    
    throw new Error(data.message || 'Failed to fetch rating options');
  } catch (error) {
    console.error('Error fetching rating options:', error);
    throw error;
  }
}

/**
 * Fetch lookup data for dropdown selections
 */
export async function fetchLookupData(): Promise<LookupData> {
  try {
    const response = await fetch('/api/lookup');
    const data = await response.json();

    if (data.success) {
      return {
        educationLevels: data.data.educationLevels || [],
        professions: data.data.professions || [],
        tujuanKunjungan: data.data.tujuanKunjungan || []
      };
    }
    
    throw new Error(data.message || 'Failed to fetch lookup data');
  } catch (error) {
    console.error('Error fetching lookup data:', error);
    throw error;
  }
}

/**
 * Submit survey responses
 */
export async function submitSurvey(submission: SurveySubmission): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/survey/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw error;
  }
}
