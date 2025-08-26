import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllQuestions,
  getSurveyStatistics,
  getSurveyResponses,
  getUniqueRespondents,
  getCompletionRate
} from '@/backend/services/surveyService';

export async function GET(request: NextRequest) {
  try {
    // Fetch survey statistics
    const statistics = await getSurveyStatistics();
    
    // Fetch all questions to get total and active counts
    const questions = await getAllQuestions();
    
    // Get unique respondents count
    const uniqueRespondents = await getUniqueRespondents();
    
    // Get completion rate
    const completionRate = await getCompletionRate();
    
    // Count the number of rating and text questions
    const ratingQuestions = questions.filter(q => q.tipe_jawaban === 'rating');
    const textQuestions = questions.filter(q => q.tipe_jawaban === 'teks');
    
    // Count active questions
    const activeQuestions = questions.filter(q => q.is_aktif);
    
    // Calculate overall statistics
    const surveyStats = {
      totalQuestions: questions.length,
      activeQuestions: activeQuestions.length,
      ratingQuestions: ratingQuestions.length,
      textQuestions: textQuestions.length,
      totalResponses: uniqueRespondents,
      completionRate: completionRate,
      averageRating: calculateAverageRating(statistics),
      statistics: statistics
    };

    return NextResponse.json({
      success: true,
      data: surveyStats
    });
  } catch (error: any) {
    console.error('Error fetching survey statistics:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate the overall average rating
function calculateAverageRating(statistics: any[]): number {
  if (!statistics.length) return 0;
  
  const validRatings = statistics.filter(stat => 
    stat.tipe_jawaban === 'rating' && 
    stat.average_rating !== null
  );
  
  if (!validRatings.length) return 0;
  
  const sum = validRatings.reduce((acc, curr) => acc + parseFloat(curr.average_rating), 0);
  return Number((sum / validRatings.length).toFixed(1));
}
