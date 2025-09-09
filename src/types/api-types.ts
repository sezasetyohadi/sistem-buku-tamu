/**
 * API Types and Interfaces
 * Comprehensive type definitions for API requests and responses
 */

// ================== COMMON API TYPES ==================

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string>;
  requestId?: string;
  timestamp?: string;
  performance?: {
    executionTime: number;
    queryCount?: number;
    cacheHit?: boolean;
  };
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  code?: string;
  statusCode: number;
  requestId?: string;
  timestamp: string;
}

// ================== REQUEST TYPES ==================

/**
 * Common query parameters for API requests
 */
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Guest query parameters
 */
export interface GuestQueryParams extends BaseQueryParams {
  status?: 'Menunggu' | 'Terjadwal' | 'Datang' | 'Selesai';
  dateFrom?: string;
  dateTo?: string;
  bidangTujuan?: string;
}

/**
 * Survey query parameters
 */
export interface SurveyQueryParams extends BaseQueryParams {
  dateFrom?: string;
  dateTo?: string;
  ratingType?: string;
}

// ================== AUTHENTICATION TYPES ==================

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response payload
 */
export interface LoginResponse {
  user: {
    id: number;
    username: string;
    nama_lengkap?: string;
    email?: string;
    is_super_admin?: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: string;
  };
  session: {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * Token refresh request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// ================== GUEST TYPES ==================

/**
 * Guest registration request
 */
export interface GuestRegistrationRequest {
  nama: string;
  email: string;
  phone: string;
  alamat?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  pendidikan_terakhir_id: number;
  profesi_id: number;
  tujuan_kunjungan_id: number;
  instansi?: string;
  keterangan?: string;
  file_upload?: string;
  cara_memperoleh?: number[];
  cara_salinan?: number[];
}

/**
 * Guest update request
 */
export interface GuestUpdateRequest extends Partial<GuestRegistrationRequest> {
  id: number;
  status?: 'Menunggu' | 'Terjadwal' | 'Datang' | 'Selesai';
}

/**
 * Guest response data
 */
export interface GuestResponse {
  id: number;
  nama: string;
  email: string;
  nomor_telp?: string;
  alamat?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  status: 'Menunggu' | 'Terjadwal' | 'Datang' | 'Selesai';
  tanggal_kunjungan: string;
  jam_datang?: string;
  jam_selesai?: string;
  pendidikan_terakhir?: string;
  profesi?: string;
  tujuan_kunjungan?: string;
  asal_instansi?: string;
  keperluan?: string;
  catatan?: string;
  file_upload?: string;
  created_at: string;
  updated_at?: string;
  token?: {
    id: number;
    token: string;
    is_active: boolean;
    created_at: string;
  };
}

// ================== SURVEY TYPES ==================

/**
 * Survey question response
 */
export interface SurveyQuestionResponse {
  id: number;
  baris: number;
  pertanyaan: string;
  tipe_jawaban: 'rating' | 'teks';
  is_aktif: boolean;
  jenis_rating_id?: number;
  is_required: boolean;
  urutan: number;
  ratingOptions?: SurveyRatingOption[];
}

/**
 * Survey rating option
 */
export interface SurveyRatingOption {
  id: number;
  jenis_rating_id: number;
  skala_rating: number;
  urutan_rating: number;
  label?: string;
}

/**
 * Survey submission request
 */
export interface SurveySubmissionRequest {
  identity: {
    nama_lengkap: string;
    email: string;
    nomor_telepon: string;
    tanggal_lahir?: string;
    jenis_kelamin: 'Laki-laki' | 'Perempuan';
    alamat?: string;
    pendidikan_terakhir_id?: number;
    pekerjaan_utama_id?: number;
    jenis_layanan_id?: number;
    saran?: string;
  };
  answers: SurveyAnswer[];
  feedback?: string;
  informasi_ids?: number[];
  salinan_ids?: number[];
}

/**
 * Survey answer
 */
export interface SurveyAnswer {
  question_id: number;
  rating?: number;
  text_answer?: string;
  jenis_rating_id: number;
}

/**
 * Survey response data
 */
export interface SurveyResponseData {
  id: number;
  nama_lengkap: string;
  email: string;
  nomor_telepon: string;
  tanggal_lahir?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  alamat?: string;
  pendidikan_terakhir?: string;
  profesi?: string;
  jenis_layanan?: string;
  saran?: string;
  created_at: string;
  answers: {
    question_id: number;
    pertanyaan: string;
    rating?: number;
    text_answer?: string;
    jenis_rating: string;
  }[];
}

// ================== STATISTICS TYPES ==================

/**
 * Application statistics
 */
export interface AppStatistics {
  totalGuests: number;
  todayGuests: number;
  completedSurveys: number;
  averageRating: number;
  guestsByStatus: {
    menunggu: number;
    terjadwal: number;
    datang: number;
    selesai: number;
  };
  monthlyTrends: {
    month: string;
    guests: number;
    surveys: number;
  }[];
}

/**
 * Database performance metrics
 */
export interface DatabaseMetrics {
  totalConnections: number;
  activeConnections: number;
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
  lastHealthCheck: string;
}

/**
 * System health status
 */
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    lastCheck: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  version: string;
}

// ================== LOOKUP TYPES ==================

/**
 * Lookup data response
 */
export interface LookupDataResponse {
  pendidikanTerakhir: LookupItem[];
  profesi: LookupItem[];
  tujuanKunjungan: LookupItem[];
  memperolehInformasi: LookupItem[];
  mendapatkanSalinan: LookupItem[];
}

/**
 * Lookup item
 */
export interface LookupItem {
  id: number;
  name: string;
  label?: string;
  description?: string;
  is_active?: boolean;
}

// ================== FILE UPLOAD TYPES ==================

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File;
  category: 'profile' | 'document' | 'other';
  guestId?: number;
  adminId?: number;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
  url: string;
  uploadedAt: string;
}

// ================== EXPORT TYPES ==================

/**
 * Export request parameters
 */
export interface ExportRequest {
  format: 'excel' | 'pdf' | 'csv';
  type: 'guests' | 'surveys' | 'statistics';
  dateFrom?: string;
  dateTo?: string;
  filters?: Record<string, unknown>;
}

/**
 * Export response
 */
export interface ExportResponse {
  filename: string;
  downloadUrl: string;
  size: number;
  format: string;
  generatedAt: string;
  expiresAt: string;
}

// ================== ERROR TYPES ==================

/**
 * API error codes
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED'
}

/**
 * Field validation error
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

// ================== HTTP STATUS TYPES ==================

/**
 * Common HTTP status codes
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}
