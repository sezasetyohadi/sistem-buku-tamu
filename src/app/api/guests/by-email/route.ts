import { NextRequest, NextResponse } from 'next/server';

import { findGuestByEmail, checkIfSurveySubmitted } from '@/backend/services/guestService';
import { withApiMiddleware } from '@/lib/api-middleware';
import { ErrorCodes, HttpStatus } from '@/lib/api-response';
import { apiLogger } from '@/lib/logger';

export const GET = withApiMiddleware(async (request, response, context) => {
  try {
    // Get email from query parameter
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return response.error(
        'Email parameter is required',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    apiLogger.info('Looking up guest by email', {
      operation: 'GET_GUEST_BY_EMAIL',
      metadata: { email }
    });

    // Find guest by email
    const guest = await findGuestByEmail(email);
    
    if (!guest) {
      return response.success(
        { found: false },
        'No guest found with this email'
      );
    }

    // Check if the guest has already submitted a survey
    const hasSubmittedSurvey = guest.id ? await checkIfSurveySubmitted(guest.id) : false;

    apiLogger.info('Guest lookup result', {
      operation: 'GET_GUEST_BY_EMAIL_RESULT',
      metadata: { 
        found: !!guest,
        hasSubmittedSurvey 
      }
    });

    return response.success({
      found: true,
      guest,
      hasSubmittedSurvey
    }, 'Guest found successfully');
  } catch (error: any) {
    apiLogger.error('Error looking up guest by email', {
      operation: 'GET_GUEST_BY_EMAIL_ERROR',
      metadata: { requestId: context.requestId }
    }, error instanceof Error ? error : new Error(String(error)));

    return response.error(
      'Failed to lookup guest',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCodes.INTERNAL_ERROR,
      { originalError: error.message }
    );
  }
});
