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

  // Use optimized paginated query for better performance
  const result = await getGuestsPaginated(filters);
  
  return response.success(
    result,
    'Guests retrieved successfully'
  );
});

export const POST = withApiMiddleware(async (request, response, context) => {
  const body = await validateJsonBody(request);
  
  // Validasi field wajib
  if (!body.nama) {
    return response.error(
      'Nama harus diisi',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      undefined,
      'nama'
    );
  }

  // Validasi jenis kelamin harus enum yang benar
  if (body.jenis_kelamin && !['Laki-laki', 'Perempuan'].includes(body.jenis_kelamin)) {
    return response.error(
      'Jenis kelamin harus "Laki-laki" atau "Perempuan"',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR,
      undefined,
      'jenis_kelamin'
    );
  }

  // Pastikan data untuk guestFormData sesuai dengan struktur tabel daftar_tamu
  const guestData: GuestFormData = {
    nama: body.nama,
    email: body.email || '',
    nomor_telp: body.nomor_telp || undefined,
    alamat: body.alamat || '',
    jenis_kelamin: body.jenis_kelamin || 'Laki-laki',
    pendidikan_terakhir_id: body.pendidikan_terakhir_id ? parseInt(body.pendidikan_terakhir_id) : undefined,
    profesi_id: body.profesi_id ? parseInt(body.profesi_id) : undefined,
    asal_instansi: body.asal_instansi || undefined,
    keperluan: body.keperluan || 'Kunjungan umum',
    catatan: body.catatan || undefined, // Add catatan_tambahan
    bidang_tujuan_id: body.bidang_tujuan_id ? parseInt(body.bidang_tujuan_id) : undefined,
    tujuan_kunjungan_id: body.tujuan_kunjungan_id ? parseInt(body.tujuan_kunjungan_id) : undefined,
    file_upload: body.file_upload || undefined,
    cara_memperoleh: body.cara_memperoleh || undefined, // Pass checkbox data
    cara_salinan: body.cara_salinan || undefined // Pass checkbox data
  };

  const guestId = await createGuest(guestData);
  
  // Create token for the new guest
  let tokenData = null;
  try {
    tokenData = await createToken(guestId);
  } catch (tokenError: any) {
    // Continue without token if token creation fails - log but don't fail the request
    context.requestId && console.warn(`Token creation failed for guest ${guestId}:`, tokenError.message);
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
  
  return response.created(
    responseData,
    'Tamu berhasil terdaftar'
  );
});
