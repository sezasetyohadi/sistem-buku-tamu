import { getGuestStatistics, getSurveyStatistics, getRecentActivities } from '@/backend/services/guestService';
import { withApiMiddleware } from '@/lib/api-middleware';

export const GET = withApiMiddleware(async (request, response, context) => {
  const [guestStats, surveyStats, recentActivities] = await Promise.all([
    getGuestStatistics(),
    getSurveyStatistics(),
    getRecentActivities(5) // Get 5 most recent activities
  ]);

  const data = {
    // Dashboard metrics for admin
    totalGuests: guestStats.totalGuests || 0,
    todayGuests: guestStats.todayGuests || 0, // Add today's guests count
    todayCheckIn: guestStats.todayCheckIn || 0,
    todayCheckOut: guestStats.todayCheckOut || 0,
    currentlyVisiting: guestStats.currentlyVisiting || 0,
    totalSurveys: surveyStats.totalSurveys || 0,
    
    // Add recent activities
    recentActivities: recentActivities,
    
    // Complete data for charts and tables
    guests: guestStats,
    surveys: surveyStats
  };

  return response.success(
    data,
    'Statistics retrieved successfully'
  );
});
