// Type definitions untuk Sistem Buku Tamu Digital
// Filename: guest-book-types.ts

export interface Guest {
  id: string;
  namaLengkap: string;
  email: string;
  alamatLengkap: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  pendidikanTerakhir: 'SD' | 'SMP' | 'SMA/SMK' | 'D3' | 'S1' | 'S2' | 'S3';
  profesiInstansi: string;
  alamatInstansi?: string;
  keperluan: string;
  tujuanPertemuan: string;
  tanggalKunjungan: string;
  jamKunjungan: string;
  fileBerkas?: File | null;
  status: 'Terdaftar' | 'Check-In' | 'Sedang Berkunjung' | 'Check-Out' | 'Selesai';
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  guestId: string;
  guestName: string;
  jenisLayanan: string;
  kategoriLayanan: string;
  deskripsi: string;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi' | 'Mendesak';
  status: 'Menunggu Review' | 'Disetujui' | 'Dalam Proses' | 'Selesai' | 'Ditolak';
  tanggalPermohonan: string;
  waktuPermohonan: string;
  estimasiSelesai?: string;
  catatan?: string;
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  guestId?: string;
  namaLengkap: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  pendidikanTerakhir: 'SD' | 'SMP' | 'SMA/SMK' | 'D3' | 'S1' | 'S2' | 'S3';
  profesiInstansi: string;
  umur: number;
  kemudahanAkses: 'Memuaskan' | 'Cukup' | 'Kurang';
  kecepatanPelayanan: 'Memuaskan' | 'Cukup' | 'Kurang';
  kemampuanPetugas: 'Memuaskan' | 'Cukup' | 'Kurang';
  kualitasHasil: 'Memuaskan' | 'Cukup' | 'Kurang';
  fasilitasTersedia: 'Memuaskan' | 'Cukup' | 'Kurang';
  saranMasukan?: string;
  rating: number; // 1-5
  submittedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Super Admin' | 'Admin' | 'Staff';
  lastLogin: string;
  isActive: boolean;
  permissions: AdminPermission[];
}

export interface AdminPermission {
  module: 'guests' | 'services' | 'reports' | 'settings' | 'users';
  actions: ('read' | 'create' | 'update' | 'delete')[];
}

export interface DashboardStats {
  totalGuests: number;
  todayCheckIn: number;
  todayCheckOut: number;
  currentlyVisiting: number;
  totalServiceRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageVisitDuration: number; // in minutes
  satisfactionRating: number; // 1-5
  trends: {
    guestsGrowth: number; // percentage
    requestsGrowth: number; // percentage
    satisfactionChange: number; // rating change
  };
}

export interface ActivityLog {
  id: string;
  type: 'check-in' | 'check-out' | 'service-request' | 'survey-complete' | 'admin-action';
  userId?: string;
  guestId?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
  };
  status?: string[];
  category?: string[];
  priority?: string[];
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  targetUsers: string[];
  createdAt: string;
  expiresAt?: string;
}

// Form Data Types
export interface GuestRegistrationForm {
  namaLengkap: string;
  email: string;
  alamatLengkap: string;
  jenisKelamin: string;
  pendidikanTerakhir: string;
  profesiInstansi: string;
  alamatInstansi: string;
  keperluan: string;
  tujuanPertemuan: string;
  tanggalKunjungan: string;
  jamKunjungan: string;
  fileBerkas: File | null;
}

export interface ServiceRequestForm {
  jenisLayanan: string;
  kategoriLayanan: string;
  deskripsi: string;
  prioritas: string;
  waktuHarapan: string;
}

export interface SurveyForm {
  namaLengkap: string;
  jenisKelamin: string;
  pendidikanTerakhir: string;
  profesiInstansi: string;
  umur: string;
  kemudahanAkses: string;
  kecepatanPelayanan: string;
  kemampuanPetugas: string;
  kualitasHasil: string;
  fasilitasTersedia: string;
  saranMasukan: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utility Types
export type FormFieldError = {
  field: string;
  message: string;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortOrder = 'asc' | 'desc';

export interface TableSort {
  field: string;
  order: SortOrder;
}

export interface TableFilter {
  field: string;
  value: string | string[];
  operator: 'equals' | 'contains' | 'in' | 'between';
}
