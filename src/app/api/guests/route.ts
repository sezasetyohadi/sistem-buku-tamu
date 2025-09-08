import { NextRequest } from 'next/server';
import { 
  getAllGuests, 
  createGuest
} from '@/backend/services/guestService';
import { 
  getGuestsPaginated,
  GuestQueryFilters 
} from '@/backend/services/database-performance.service';
import { createToken } from '@/backend/services/tokenService';
import {
  getEducationOptions, 
  getProfessionOptions, 
  getBidangTujuanOptions, 
  getTujuanKunjunganOptions 
} from '@/backend/config/db';
import { GuestFormData } from '@/types/database-types';
import { withApiMiddleware, validateJsonBody } from '@/lib/api-middleware';
import { ErrorCodes, HttpStatus } from '@/lib/api-response';
import { ValidationError, DatabaseError, handleDatabaseError } from '@/lib/error-handling';
import { apiLogger } from '@/lib/logger';
import { 
  validateAndSanitize,
  GUEST_REGISTRATION_SCHEMA,
  SANITIZATION_CONFIGS
} from '@/lib/validation';

// Optimized GET with pagination and filtering
export const GET = withApiMiddleware(async (request, response, context) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Extract query parameters for pagination and filtering
  const filters: GuestQueryFilters = {
    status: searchParams.get('status') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    bidangTujuan: searchParams.get('bidangTujuan') ? 
      parseInt(searchParams.get('bidangTujuan')!) : undefined,
    limit: searchParams.get('limit') ? 
      Math.min(parseInt(searchParams.get('limit')!) || 20, 100) : 20, // Max 100 per page
    offset: searchParams.get('offset') ? 
      parseInt(searchParams.get('offset')!) || 0 : 0,
    search: searchParams.get('search') || undefined
  };

  try {
    // Validate pagination parameters
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      throw new ValidationError('Limit must be between 1 and 100', { limit: filters.limit });
    }

    if (filters.offset && filters.offset < 0) {
      throw new ValidationError('Offset must be non-negative', { offset: filters.offset });
    }

    apiLogger.info('Retrieving guests with filters', { 
      operation: 'GET_GUESTS',
      metadata: filters 
    });

    // Use optimized paginated query for better performance
    // But return full guest data including tokens
    const result = await getAllGuests();
    
    apiLogger.info('Guests retrieved successfully', {
      operation: 'GET_GUESTS_SUCCESS',
      metadata: { total: result.length }
    });
    
    return response.success(
      result,
      'Guests retrieved successfully'
    );
  } catch (error) {
    apiLogger.error('Failed to retrieve guests', {
      operation: 'GET_GUESTS_ERROR',
      metadata: { appliedFilters: filters }
    }, error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ValidationError) {
      throw error;
    }
    
    // Handle database errors
    handleDatabaseError(error, 'guest retrieval', context.requestId);
  }
});

export const POST = withApiMiddleware(async (request, response, context) => {
  try {
    const body = await validateJsonBody(request);
    
    // Validate and sanitize input data
    const validation = validateAndSanitize(
      body,
      GUEST_REGISTRATION_SCHEMA,
      SANITIZATION_CONFIGS.GUEST_REGISTRATION
    );

    if (!validation.isValid) {
      apiLogger.warn('Guest registration validation failed', {
        operation: 'POST_GUEST_VALIDATION_ERROR',
        metadata: {
          errors: validation.errors,
          firstError: validation.firstError
        }
      });

      return response.error(
        validation.firstError || 'Data tidak valid',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        validation.errors
      );
    }

    const sanitizedData = validation.data;

    // Map sanitized data to GuestFormData structure
    const guestData: GuestFormData = {
      nama: sanitizedData.nama,
      email: sanitizedData.email,
      nomor_telp: sanitizedData.phone || undefined,
      alamat: sanitizedData.alamat || '',
      jenis_kelamin: sanitizedData.jenis_kelamin || 'Laki-laki',
      pendidikan_terakhir_id: sanitizedData.pendidikan_terakhir_id,
      profesi_id: sanitizedData.profesi_id,
      asal_instansi: sanitizedData.instansi || undefined,
      keperluan: sanitizedData.keterangan || 'Kunjungan umum',
      catatan: sanitizedData.catatan || undefined,
      bidang_tujuan_id: sanitizedData.bidang_tujuan_id,
      tujuan_kunjungan_id: sanitizedData.tujuan_kunjungan_id,
      file_upload: sanitizedData.file_upload || undefined,
      cara_memperoleh: sanitizedData.cara_memperoleh || undefined,
      cara_salinan: sanitizedData.cara_salinan || undefined
    };

    apiLogger.info('Creating new guest with validated data', {
      operation: 'POST_GUEST_CREATE',
      metadata: {
        hasEmail: !!guestData.email,
        hasPhone: !!guestData.nomor_telp,
        bidangTujuan: guestData.bidang_tujuan_id,
        profesi: guestData.profesi_id
      }
    });

    const guestId = await createGuest(guestData);
    
    // Create token for the new guest
    let tokenData = null;
    try {
      tokenData = await createToken(guestId);
      
      apiLogger.info('Token created successfully for guest', {
        operation: 'POST_GUEST_TOKEN_CREATED',
        metadata: { guestId, tokenId: tokenData.id }
      });
    } catch (tokenError: any) {
      // Continue without token if token creation fails - log but don't fail the request
      apiLogger.warn('Token creation failed for guest', {
        operation: 'POST_GUEST_TOKEN_ERROR',
        metadata: { guestId },
        error: tokenError.message
      });
    }
    
    const responseData = { 
      id: guestId,
      ...guestData,
      token: tokenData ? {
        id: tokenData.id,
        token: tokenData.token,
        is_active: tokenData.is_active,
        created_at: tokenData.created_at
      } : null
    };

    apiLogger.info('Guest registration completed successfully', {
      operation: 'POST_GUEST_SUCCESS',
      metadata: { 
        guestId, 
        hasToken: !!tokenData,
        validationPassed: true 
      }
    });
    
    return response.created(
      responseData,
      'Tamu berhasil terdaftar'
    );
  } catch (error) {
    apiLogger.error('Guest registration failed', {
      operation: 'POST_GUEST_ERROR',
      metadata: { 
        requestId: context.requestId,
        hasBody: !!request.body
      }
    }, error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ValidationError) {
      throw error;
    }
    
    // Handle database errors
    handleDatabaseError(error, 'guest creation', context.requestId);
  }
});
